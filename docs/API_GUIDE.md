# Manus Gateway API Guide

**Complete guide for integrating Manus Gateway into your applications**

---

## Overview

Manus Gateway provides a REST API that allows external applications to submit tasks to Manus via email and track their status programmatically. The API follows RESTful principles with JSON request/response format and uses API keys for authentication.

**Base URL:** `https://your-domain.manus.space/api/v1`

**API Version:** 1.0

**Protocol:** REST over HTTPS

**Data Format:** JSON

---

## Authentication

All API requests require authentication using an API key passed in the `X-API-Key` header.

### Creating an API Key

**Step 1:** Log in to Manus Gateway web interface

**Step 2:** Navigate to the **API Keys** page from the main navigation

**Step 3:** Click **"Create Key"** button

**Step 4:** Enter an optional name for the key (e.g., "Production Server", "Mobile App")

**Step 5:** **Copy the key immediately** - it will only be shown once

**Step 6:** Store the key securely using environment variables or a secrets manager

### API Key Format

API keys follow the format: `manus_[64-character-hex-string]`

Example: `manus_2dc77a6e57c99ed02f28453960ac3315fe517cd05c6be0f51feca3e789af5ddb`

### Using API Keys

Include the API key in the `X-API-Key` header of every request:

```
X-API-Key: manus_2dc77a6e57c99ed02f28453960ac3315fe517cd05c6be0f51feca3e789af5ddb
```

**Security Best Practices:**

- Never hardcode API keys in source code
- Use environment variables or secure configuration management
- Rotate keys regularly
- Delete unused keys immediately
- Use different keys for different environments (development, staging, production)

---

## API Endpoints

### Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/tasks` | POST | Create a new task |
| `/api/v1/tasks/:taskUuid` | GET | Get task details by UUID |
| `/api/v1/tasks` | GET | List tasks with filtering and pagination |

---

## Detailed Endpoint Documentation

### 1. Create Task

Submit a new task to Manus via email.

**Endpoint:** `POST /api/v1/tasks`

**Authentication:** Required (API Key)

**Request Headers:**

```
Content-Type: application/json
X-API-Key: your_api_key_here
```

**Request Body:**

```json
{
  "prompt": "Your task description here"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | The task description to send to Manus (max 10,000 characters) |

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "taskUuid": "TASK-A54CC3B465D47616",
    "status": "pending",
    "message": "Task created successfully and email sent to Manus"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data.taskUuid` | string | Unique identifier for the task (format: `TASK-[16-hex-chars]`) |
| `data.status` | string | Current task status (see Status Values below) |
| `data.message` | string | Human-readable message about the operation |

**Status Values:**

- `pending` - Task created, waiting to be sent
- `sent` - Email sent to Manus
- `processing` - Manus is working on the task
- `completed` - Task completed successfully, result available
- `failed` - Task failed, check errorMessage

**Error Response (400 Bad Request):**

```json
{
  "error": "Bad Request",
  "message": "Prompt is required"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

**Example (curl):**

```bash
curl -X POST "https://your-domain.manus.space/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: manus_2dc77a6e57c99ed02f28453960ac3315fe517cd05c6be0f51feca3e789af5ddb" \
  -d '{"prompt": "Analyze the latest trends in AI development"}'
```

**Example (Python):**

```python
import requests
import os

API_URL = "https://your-domain.manus.space/api/v1"
API_KEY = os.environ["MANUS_API_KEY"]

def create_task(prompt):
    """Create a new task in Manus Gateway"""
    url = f"{API_URL}/tasks"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    data = {"prompt": prompt}
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    result = response.json()
    return result["data"]

# Usage
try:
    task = create_task("Summarize the key points from the latest OpenAI research paper")
    print(f"✓ Task created successfully")
    print(f"  UUID: {task['taskUuid']}")
    print(f"  Status: {task['status']}")
    print(f"  Message: {task['message']}")
except requests.exceptions.HTTPError as e:
    print(f"✗ Error: {e.response.json()['message']}")
```

**Example (JavaScript/Node.js):**

```javascript
const API_URL = "https://your-domain.manus.space/api/v1";
const API_KEY = process.env.MANUS_API_KEY;

async function createTask(prompt) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({ prompt })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const result = await response.json();
  return result.data;
}

// Usage
createTask("Create a detailed marketing plan for a new SaaS product")
  .then(task => {
    console.log("✓ Task created successfully");
    console.log(`  UUID: ${task.taskUuid}`);
    console.log(`  Status: ${task.status}`);
    console.log(`  Message: ${task.message}`);
  })
  .catch(error => {
    console.error(`✗ Error: ${error.message}`);
  });
```

---

### 2. Get Task

Retrieve details of a specific task by its UUID.

**Endpoint:** `GET /api/v1/tasks/:taskUuid`

**Authentication:** Required (API Key)

**Request Headers:**

```
X-API-Key: your_api_key_here
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskUuid` | string | Yes | The unique task identifier (e.g., `TASK-A54CC3B465D47616`) |

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "taskUuid": "TASK-A54CC3B465D47616",
    "prompt": "Analyze the latest trends in AI development",
    "status": "completed",
    "result": "Based on recent research and industry reports, here are the key trends...",
    "errorMessage": null,
    "createdAt": "2025-11-19T15:32:29.000Z",
    "updatedAt": "2025-11-19T15:45:12.000Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data.taskUuid` | string | Unique task identifier |
| `data.prompt` | string | The original task prompt |
| `data.status` | string | Current task status |
| `data.result` | string \| null | Task result (available when status is `completed`) |
| `data.errorMessage` | string \| null | Error message (available when status is `failed`) |
| `data.createdAt` | string | ISO 8601 timestamp of task creation |
| `data.updatedAt` | string | ISO 8601 timestamp of last update |

**Error Response (404 Not Found):**

```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

**Example (curl):**

```bash
curl -X GET "https://your-domain.manus.space/api/v1/tasks/TASK-A54CC3B465D47616" \
  -H "X-API-Key: manus_2dc77a6e57c99ed02f28453960ac3315fe517cd05c6be0f51feca3e789af5ddb"
```

**Example (Python):**

```python
import requests
import os

API_URL = "https://your-domain.manus.space/api/v1"
API_KEY = os.environ["MANUS_API_KEY"]

def get_task(task_uuid):
    """Get task details by UUID"""
    url = f"{API_URL}/tasks/{task_uuid}"
    headers = {"X-API-Key": API_KEY}
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    result = response.json()
    return result["data"]

# Usage
try:
    task = get_task("TASK-A54CC3B465D47616")
    print(f"Task: {task['taskUuid']}")
    print(f"Status: {task['status']}")
    print(f"Prompt: {task['prompt']}")
    
    if task['status'] == 'completed':
        print(f"Result: {task['result']}")
    elif task['status'] == 'failed':
        print(f"Error: {task['errorMessage']}")
    else:
        print(f"Task is still {task['status']}")
        
except requests.exceptions.HTTPError as e:
    print(f"Error: {e.response.json()['message']}")
```

**Example (JavaScript/Node.js):**

```javascript
const API_URL = "https://your-domain.manus.space/api/v1";
const API_KEY = process.env.MANUS_API_KEY;

async function getTask(taskUuid) {
  const response = await fetch(`${API_URL}/tasks/${taskUuid}`, {
    headers: {
      "X-API-Key": API_KEY
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const result = await response.json();
  return result.data;
}

// Usage
getTask("TASK-A54CC3B465D47616")
  .then(task => {
    console.log(`Task: ${task.taskUuid}`);
    console.log(`Status: ${task.status}`);
    console.log(`Prompt: ${task.prompt}`);
    
    if (task.status === 'completed') {
      console.log(`Result: ${task.result}`);
    } else if (task.status === 'failed') {
      console.log(`Error: ${task.errorMessage}`);
    } else {
      console.log(`Task is still ${task.status}`);
    }
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
  });
```

---

### 3. List Tasks

Retrieve a paginated list of tasks with optional filtering.

**Endpoint:** `GET /api/v1/tasks`

**Authentication:** Required (API Key)

**Request Headers:**

```
X-API-Key: your_api_key_here
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (starts from 1) |
| `limit` | integer | No | 25 | Number of items per page (max: 100) |
| `status` | string | No | - | Filter by status: `pending`, `sent`, `processing`, `completed`, `failed` |

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "taskUuid": "TASK-A54CC3B465D47616",
        "prompt": "Analyze the latest trends in AI development",
        "status": "completed",
        "result": "Based on recent research...",
        "errorMessage": null,
        "createdAt": "2025-11-19T15:32:29.000Z",
        "updatedAt": "2025-11-19T15:45:12.000Z"
      },
      {
        "taskUuid": "TASK-B7E3947FE2EC9B79",
        "prompt": "Create a marketing plan",
        "status": "processing",
        "result": null,
        "errorMessage": null,
        "createdAt": "2025-11-19T14:20:15.000Z",
        "updatedAt": "2025-11-19T14:25:30.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 642,
      "totalPages": 26
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data.tasks` | array | Array of task objects (see Get Task for field descriptions) |
| `data.pagination.page` | integer | Current page number |
| `data.pagination.limit` | integer | Items per page |
| `data.pagination.total` | integer | Total number of tasks matching the filter |
| `data.pagination.totalPages` | integer | Total number of pages |

**Example (curl):**

```bash
# Get first page of all tasks
curl -X GET "https://your-domain.manus.space/api/v1/tasks?page=1&limit=10" \
  -H "X-API-Key: manus_2dc77a6e57c99ed02f28453960ac3315fe517cd05c6be0f51feca3e789af5ddb"

# Get only completed tasks
curl -X GET "https://your-domain.manus.space/api/v1/tasks?status=completed&page=1&limit=10" \
  -H "X-API-Key: manus_2dc77a6e57c99ed02f28453960ac3315fe517cd05c6be0f51feca3e789af5ddb"
```

**Example (Python):**

```python
import requests
import os

API_URL = "https://your-domain.manus.space/api/v1"
API_KEY = os.environ["MANUS_API_KEY"]

def list_tasks(page=1, limit=25, status=None):
    """List tasks with pagination and optional status filter"""
    url = f"{API_URL}/tasks"
    headers = {"X-API-Key": API_KEY}
    params = {"page": page, "limit": limit}
    
    if status:
        params["status"] = status
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    result = response.json()
    return result["data"]

# Usage: Get all completed tasks
try:
    data = list_tasks(page=1, limit=10, status="completed")
    
    print(f"Showing page {data['pagination']['page']} of {data['pagination']['totalPages']}")
    print(f"Total tasks: {data['pagination']['total']}\n")
    
    for task in data['tasks']:
        print(f"• {task['taskUuid']}")
        print(f"  Prompt: {task['prompt'][:50]}...")
        print(f"  Status: {task['status']}")
        print(f"  Created: {task['createdAt']}\n")
        
except requests.exceptions.HTTPError as e:
    print(f"Error: {e.response.json()['message']}")
```

**Example (JavaScript/Node.js):**

```javascript
const API_URL = "https://your-domain.manus.space/api/v1";
const API_KEY = process.env.MANUS_API_KEY;

async function listTasks(page = 1, limit = 25, status = null) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  
  const response = await fetch(`${API_URL}/tasks?${params}`, {
    headers: {
      "X-API-Key": API_KEY
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const result = await response.json();
  return result.data;
}

// Usage: Get all completed tasks
listTasks(1, 10, 'completed')
  .then(data => {
    console.log(`Showing page ${data.pagination.page} of ${data.pagination.totalPages}`);
    console.log(`Total tasks: ${data.pagination.total}\n`);
    
    data.tasks.forEach(task => {
      console.log(`• ${task.taskUuid}`);
      console.log(`  Prompt: ${task.prompt.substring(0, 50)}...`);
      console.log(`  Status: ${task.status}`);
      console.log(`  Created: ${task.createdAt}\n`);
    });
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
  });
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `200 OK` | Request successful | - |
| `201 Created` | Resource created successfully | - |
| `400 Bad Request` | Invalid request parameters | Missing required fields, invalid data format |
| `401 Unauthorized` | Authentication failed | Missing API key, invalid API key |
| `403 Forbidden` | Access denied | Trying to access another user's resources |
| `404 Not Found` | Resource not found | Invalid task UUID, deleted resource |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests in a short time |
| `500 Internal Server Error` | Server error | Unexpected server-side error |

### Error Handling Best Practices

**1. Always check HTTP status codes:**

```python
response = requests.post(url, headers=headers, json=data)
if response.status_code != 200:
    error = response.json()
    print(f"Error {response.status_code}: {error['message']}")
    return None
```

**2. Implement retry logic with exponential backoff:**

```python
import time

def create_task_with_retry(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            return create_task(prompt)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")
```

**3. Handle specific error cases:**

```javascript
try {
  const task = await createTask(prompt);
  console.log("Task created:", task.taskUuid);
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("Authentication error: Check your API key");
  } else if (error.message.includes("not found")) {
    console.error("Task not found: It may have been deleted");
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

---

## Polling for Task Completion

Since Manus processes tasks asynchronously, you need to poll the API to check for completion.

### Polling Strategy

**Recommended approach:** Start with short intervals and gradually increase the delay to reduce API load.

```python
import time

def wait_for_completion(task_uuid, max_wait=3600, initial_interval=5):
    """
    Poll for task completion with exponential backoff
    
    Args:
        task_uuid: The task UUID to monitor
        max_wait: Maximum time to wait in seconds (default: 1 hour)
        initial_interval: Initial polling interval in seconds (default: 5s)
    
    Returns:
        The completed task object
    """
    start_time = time.time()
    interval = initial_interval
    
    while time.time() - start_time < max_wait:
        task = get_task(task_uuid)
        
        if task['status'] in ['completed', 'failed']:
            return task
        
        print(f"Task {task['status']}... checking again in {interval}s")
        time.sleep(interval)
        
        # Exponential backoff: 5s, 10s, 20s, 40s, max 60s
        interval = min(interval * 2, 60)
    
    raise TimeoutError(f"Task did not complete within {max_wait} seconds")

# Usage
task = create_task("Analyze quarterly sales data")
print(f"Task created: {task['taskUuid']}")

completed_task = wait_for_completion(task['taskUuid'])

if completed_task['status'] == 'completed':
    print(f"Result: {completed_task['result']}")
else:
    print(f"Task failed: {completed_task['errorMessage']}")
```

### Webhook Alternative

For production applications, consider implementing webhooks instead of polling. This allows Manus Gateway to push notifications when tasks complete, reducing API load and improving response times.

*(Webhook functionality coming soon)*

---

## Rate Limiting

To ensure fair usage and system stability, API requests are rate-limited per API key.

**Current Limits:**
- 100 requests per minute per API key
- 1000 requests per hour per API key

**Rate Limit Headers:**

The API includes rate limit information in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637251200
```

**Handling Rate Limits:**

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds."
}
```

Implement exponential backoff when you encounter rate limits (see Error Handling section).

---

## Complete Integration Example

Here's a complete example showing how to create a task, poll for completion, and handle errors:

### Python Complete Example

```python
import requests
import time
import os
from typing import Optional, Dict

class ManusGatewayClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": api_key
        }
    
    def create_task(self, prompt: str) -> Dict:
        """Create a new task"""
        url = f"{self.base_url}/api/v1/tasks"
        response = requests.post(url, headers=self.headers, json={"prompt": prompt})
        response.raise_for_status()
        return response.json()["data"]
    
    def get_task(self, task_uuid: str) -> Dict:
        """Get task details"""
        url = f"{self.base_url}/api/v1/tasks/{task_uuid}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()["data"]
    
    def list_tasks(self, page: int = 1, limit: int = 25, status: Optional[str] = None) -> Dict:
        """List tasks with pagination"""
        url = f"{self.base_url}/api/v1/tasks"
        params = {"page": page, "limit": limit}
        if status:
            params["status"] = status
        
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()["data"]
    
    def wait_for_completion(self, task_uuid: str, max_wait: int = 3600, initial_interval: int = 5) -> Dict:
        """Poll for task completion with exponential backoff"""
        start_time = time.time()
        interval = initial_interval
        
        while time.time() - start_time < max_wait:
            task = self.get_task(task_uuid)
            
            if task['status'] in ['completed', 'failed']:
                return task
            
            print(f"Task {task['status']}... checking again in {interval}s")
            time.sleep(interval)
            interval = min(interval * 2, 60)
        
        raise TimeoutError(f"Task did not complete within {max_wait} seconds")

# Usage
if __name__ == "__main__":
    client = ManusGatewayClient(
        base_url=os.environ["MANUS_BASE_URL"],
        api_key=os.environ["MANUS_API_KEY"]
    )
    
    try:
        # Create a task
        task = client.create_task("Analyze the quarterly sales data and provide insights")
        print(f"✓ Task created: {task['taskUuid']}")
        
        # Wait for completion
        completed_task = client.wait_for_completion(task['taskUuid'])
        
        # Process result
        if completed_task['status'] == 'completed':
            print(f"✓ Task completed!")
            print(f"Result: {completed_task['result']}")
        else:
            print(f"✗ Task failed: {completed_task['errorMessage']}")
            
    except requests.exceptions.HTTPError as e:
        print(f"✗ HTTP Error: {e.response.json()['message']}")
    except Exception as e:
        print(f"✗ Error: {str(e)}")
```

### JavaScript Complete Example

```javascript
class ManusGatewayClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    };
  }
  
  async createTask(prompt) {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  async getTask(taskUuid) {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks/${taskUuid}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  async listTasks(page = 1, limit = 25, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.baseUrl}/api/v1/tasks?${params}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  async waitForCompletion(taskUuid, maxWait = 3600, initialInterval = 5) {
    const startTime = Date.now();
    let interval = initialInterval * 1000; // Convert to milliseconds
    
    while (Date.now() - startTime < maxWait * 1000) {
      const task = await this.getTask(taskUuid);
      
      if (['completed', 'failed'].includes(task.status)) {
        return task;
      }
      
      console.log(`Task ${task.status}... checking again in ${interval/1000}s`);
      await new Promise(resolve => setTimeout(resolve, interval));
      interval = Math.min(interval * 2, 60000); // Max 60s
    }
    
    throw new Error(`Task did not complete within ${maxWait} seconds`);
  }
}

// Usage
(async () => {
  const client = new ManusGatewayClient(
    process.env.MANUS_BASE_URL,
    process.env.MANUS_API_KEY
  );
  
  try {
    // Create a task
    const task = await client.createTask("Analyze the quarterly sales data and provide insights");
    console.log(`✓ Task created: ${task.taskUuid}`);
    
    // Wait for completion
    const completedTask = await client.waitForCompletion(task.taskUuid);
    
    // Process result
    if (completedTask.status === 'completed') {
      console.log('✓ Task completed!');
      console.log(`Result: ${completedTask.result}`);
    } else {
      console.log(`✗ Task failed: ${completedTask.errorMessage}`);
    }
    
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
})();
```

---

## Best Practices

### 1. Use Environment Variables

Never hardcode API keys or base URLs:

```bash
# .env file
MANUS_BASE_URL=https://your-domain.manus.space
MANUS_API_KEY=manus_your_api_key_here
```

### 2. Implement Proper Error Handling

Always handle errors gracefully and provide meaningful feedback to users.

### 3. Use Exponential Backoff for Polling

Start with short intervals and gradually increase to reduce API load.

### 4. Respect Rate Limits

Implement rate limit handling and backoff strategies.

### 5. Log API Interactions

Log all API requests and responses for debugging and monitoring:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_task(prompt):
    logger.info(f"Creating task with prompt: {prompt[:50]}...")
    try:
        task = client.create_task(prompt)
        logger.info(f"Task created: {task['taskUuid']}")
        return task
    except Exception as e:
        logger.error(f"Failed to create task: {str(e)}")
        raise
```

### 6. Use Timeouts

Always set timeouts for HTTP requests to prevent hanging:

```python
response = requests.post(url, headers=headers, json=data, timeout=30)
```

### 7. Validate Input

Validate prompts before sending to the API:

```python
def validate_prompt(prompt):
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")
    if len(prompt) > 10000:
        raise ValueError("Prompt exceeds maximum length of 10,000 characters")
    return prompt.strip()
```

---

## Support and Resources

### Documentation

- **API Guide** (this document): Complete REST API reference
- **SDK Documentation**: Guide for using official Python and JavaScript SDKs
- **API Playground**: Interactive tool for testing API endpoints (available in web interface)

### Getting Help

If you encounter issues or have questions:

1. Check the error message and HTTP status code
2. Review the relevant section in this documentation
3. Test your request in the API Playground
4. Contact support at https://help.manus.im

### Changelog

**Version 1.0 (2025-11-19)**
- Initial REST API release
- Endpoints: Create Task, Get Task, List Tasks
- API key authentication
- Multi-user support with data isolation

---

## Appendix: Task Status Lifecycle

Understanding the task status lifecycle helps you build robust integrations:

```
pending → sent → processing → completed
                            ↘ failed
```

**Status Descriptions:**

| Status | Description | Next Possible States |
|--------|-------------|---------------------|
| `pending` | Task created, queued for sending | `sent`, `failed` |
| `sent` | Email sent to Manus, awaiting response | `processing`, `failed` |
| `processing` | Manus is working on the task | `completed`, `failed` |
| `completed` | Task finished successfully, result available | *(terminal state)* |
| `failed` | Task failed, error message available | *(terminal state)* |

**Typical Timeline:**

- `pending` → `sent`: Immediate (< 1 second)
- `sent` → `processing`: 1-5 minutes (depends on email delivery)
- `processing` → `completed`: 5-30 minutes (depends on task complexity)

**Polling Recommendations:**

- Poll every 5 seconds for the first minute
- Poll every 30 seconds for the next 5 minutes
- Poll every 60 seconds thereafter
- Set a maximum wait time (e.g., 1 hour) to prevent infinite loops
