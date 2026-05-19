"""risk_graph service — 物流风险知识图谱构建与节点富化。"""

from sqlalchemy.orm import Session

from app.models.risk import IntelligenceNews
from app.schemas.risk import GraphNode, GraphLink, GraphResponse

# 预置的关联图数据（基于种子情报构建三元组）
GRAPH_SEED = {
    "nodes": [
        # 风险事件
        {"id": "evt-red-sea", "label": "红海航线受阻", "type": "event",
         "properties": {"risk_level": "CRITICAL", "region": "红海", "since": "2024-03-24"}},
        {"id": "evt-rotterdam", "label": "鹿特丹罢工", "type": "event",
         "properties": {"risk_level": "HIGH", "region": "鹿特丹", "since": "2024-03-24"}},
        {"id": "evt-typhoon", "label": "台风海葵", "type": "event",
         "properties": {"risk_level": "HIGH", "region": "华东", "since": "2024-03-23"}},
        {"id": "evt-panama", "label": "巴拿马运河限行", "type": "event",
         "properties": {"risk_level": "MODERATE", "region": "巴拿马", "since": "2024-03-23"}},

        # 港口
        {"id": "port-shanghai", "label": "上海港", "type": "port",
         "properties": {"country": "CN", "status": "disrupted"}},
        {"id": "port-ningbo", "label": "宁波港", "type": "port",
         "properties": {"country": "CN", "status": "disrupted"}},
        {"id": "port-rotterdam", "label": "鹿特丹港", "type": "port",
         "properties": {"country": "NL", "status": "blocked"}},
        {"id": "port-hamburg", "label": "汉堡港", "type": "port",
         "properties": {"country": "DE", "status": "active"}},
        {"id": "port-singapore", "label": "新加坡港", "type": "port",
         "properties": {"country": "SG", "status": "active"}},
        {"id": "port-jeddah", "label": "吉达港", "type": "port",
         "properties": {"country": "SA", "status": "disrupted"}},

        # 船舶
        {"id": "ship-cosco-1", "label": "COSCO Venus", "type": "ship",
         "properties": {"imo": "9876543", "flag": "CN", "cargo": "工业传感器"}},
        {"id": "ship-msc-2", "label": "MSC Aurora", "type": "ship",
         "properties": {"imo": "9123456", "flag": "PA", "cargo": "电子元件"}},
        {"id": "ship-maersk-3", "label": "Maersk Eagle", "type": "ship",
         "properties": {"imo": "9456789", "flag": "DK", "cargo": "机械设备"}},
        {"id": "ship-evergreen-4", "label": "Ever Given II", "type": "ship",
         "properties": {"imo": "9781234", "flag": "TW", "cargo": "通信设备"}},

        # 订单
        {"id": "ord-CN82991022", "label": "#CN82991022", "type": "order",
         "properties": {"shipper": "智联电子制造", "route": "深圳→鹿特丹", "status": "rerouting"}},
        {"id": "ord-CN77218841", "label": "#CN77218841", "type": "order",
         "properties": {"shipper": "环球科技", "route": "上海→汉堡", "status": "delayed"}},
        {"id": "ord-CN65432100", "label": "#CN65432100", "type": "order",
         "properties": {"shipper": "未来物流", "route": "上海→洛杉矶", "status": "delayed"}},
        {"id": "ord-CN11223344", "label": "#CN11223344", "type": "order",
         "properties": {"shipper": "星辰供应链", "route": "深圳→纽约", "status": "pending"}},
    ],
    "links": [
        # 事件 → 影响港口
        {"source": "evt-red-sea", "target": "port-jeddah", "relationship": "blocks"},
        {"source": "evt-red-sea", "target": "port-singapore", "relationship": "disrupts"},
        {"source": "evt-rotterdam", "target": "port-rotterdam", "relationship": "blocks"},
        {"source": "evt-typhoon", "target": "port-shanghai", "relationship": "disrupts"},
        {"source": "evt-typhoon", "target": "port-ningbo", "relationship": "disrupts"},

        # 港口 → 船舶挂靠
        {"source": "port-shanghai", "target": "ship-cosco-1", "relationship": "docked_at"},
        {"source": "port-shanghai", "target": "ship-msc-2", "relationship": "docked_at"},
        {"source": "port-rotterdam", "target": "ship-maersk-3", "relationship": "scheduled"},
        {"source": "port-singapore", "target": "ship-evergreen-4", "relationship": "transit"},
        {"source": "port-hamburg", "target": "ship-maersk-3", "relationship": "rerouted_to"},

        # 船舶 → 订单承运
        {"source": "ship-cosco-1", "target": "ord-CN82991022", "relationship": "carries"},
        {"source": "ship-msc-2", "target": "ord-CN77218841", "relationship": "carries"},
        {"source": "ship-maersk-3", "target": "ord-CN65432100", "relationship": "carries"},
        {"source": "ship-evergreen-4", "target": "ord-CN11223344", "relationship": "carries"},

        # 事件 → 间接影响订单（跨层传播）
        {"source": "evt-red-sea", "target": "ord-CN82991022", "relationship": "affects"},
        {"source": "evt-rotterdam", "target": "ord-CN82991022", "relationship": "affects"},
        {"source": "evt-typhoon", "target": "ord-CN77218841", "relationship": "affects"},
        {"source": "evt-typhoon", "target": "ord-CN65432100", "relationship": "affects"},
        {"source": "evt-panama", "target": "ord-CN11223344", "relationship": "affects"},
    ],
}

# 数据库情报 ID → 图节点 ID 映射
_EVT_ID_MAP = {1: "evt-red-sea", 2: "evt-rotterdam", 3: "evt-typhoon", 4: "evt-panama"}


def build_risk_graph(db: Session) -> GraphResponse:
    """构建风险知识图谱，用数据库最新情报覆盖事件节点标签。"""
    news_items = db.query(IntelligenceNews).all()
    news_map = {n.id: n for n in news_items}

    nodes = []
    for n in GRAPH_SEED["nodes"]:
        node = dict(n)
        for db_id, node_id in _EVT_ID_MAP.items():
            if node["id"] == node_id and db_id in news_map:
                node = {**node, "label": news_map[db_id].title[:20] + "..."}
        nodes.append(node)

    return GraphResponse(
        nodes=[GraphNode(**n) for n in nodes],
        links=[GraphLink(**l) for l in GRAPH_SEED["links"]],
    )
