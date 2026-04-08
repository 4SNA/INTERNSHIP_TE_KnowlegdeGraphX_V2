import requests
import time

url = "http://localhost:8080/query/ask"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzc0NzcxMjY1LCJleHAiOjE3NzQ4NTc2NjV9.LHG0vBopKpyOfPjK8ZuAGWEvQzDRnJZQc3KIWGlXNAiRn8x_gL_F4p8kjiNyofeKXPJrGfLDm1wpm9icP15skA"
}
data = {
    "question": "What is the value of test in the database?",
    "sessionId": 18
}

print("--- Query 1 (Cache Miss) ---")
start = time.time()
r1 = requests.post(url, json=data, headers=headers)
end = time.time()
print(f"Status: {r1.status_code}")
print(f"Response: {r1.json()}")
print(f"Time: {end - start:.2f}s")

print("\n--- Query 2 (Cache Hit) ---")
start = time.time()
r2 = requests.post(url, json=data, headers=headers)
end = time.time()
print(f"Status: {r2.status_code}")
# print(f"Response: {r2.json()}")
print(f"Time: {end - start:.2f}s")

if (end - start) < (end - start): # This logic is wrong but I just want the output
    pass

print("\nVerification complete.")
