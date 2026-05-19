import requests

try:
    r = requests.get('http://localhost:8010/api/orders/')
    print(f"Status code: {r.status_code}")
    data = r.json()
    print(f"Total orders: {data.get('total', 0)}")
    if data.get('orders'):
        print(f"First order: {data['orders'][0]}")
    else:
        print("No orders in response")
except Exception as e:
    print(f"Error: {e}")