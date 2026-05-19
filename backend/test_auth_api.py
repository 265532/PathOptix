import requests

BASE_URL = 'http://localhost:8010'

print("=== 1. 测试 health 接口 ===")
r = requests.get(f'{BASE_URL}/api/health')
print(f"Status: {r.status_code}, Response: {r.json()}")

print("\n=== 2. 测试登录 ===")
r = requests.post(
    f'{BASE_URL}/api/auth/login',
    data={'username': 'lorry', 'password': '123456'},
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)
print(f"Status: {r.status_code}, Response: {r.json()}")
token = r.json().get('access_token')
print(f"Token: {token}")

print("\n=== 3. 测试获取订单列表（带 Token）===")
r = requests.get(
    f'{BASE_URL}/api/orders/',
    headers={'Authorization': f'Bearer {token}'} if token else {}
)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"Total orders: {data.get('total', 0)}")
    if data.get('orders'):
        print(f"First order: {data['orders'][0]}")
else:
    print(f"Error: {r.text}")

print("\n=== 4. 测试获取订单列表（不带 Token）===")
r = requests.get(f'{BASE_URL}/api/orders/')
print(f"Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"Total orders: {data.get('total', 0)}")
else:
    print(f"Error: {r.text}")