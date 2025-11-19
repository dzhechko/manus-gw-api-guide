# Manus Gateway SDK Documentation

This document provides comprehensive guidance for using the official Manus Gateway SDKs to integrate with your applications. The SDKs are available for both Python and JavaScript/TypeScript, providing a consistent and developer-friendly interface for task automation.

## Overview

The Manus Gateway SDKs enable you to programmatically interact with Manus AI through a simple API. Instead of manually sending emails and checking for responses, you can create tasks, monitor their progress, and retrieve results directly from your code.

### Key Features

The SDKs provide the following capabilities:

**Task Management**: Create new tasks with custom prompts, retrieve task details by UUID, and list all tasks with filtering and pagination support.

**Status Monitoring**: Poll for task completion with configurable intervals, receive real-time status updates, and handle completion or failure states appropriately.

**Error Handling**: Comprehensive exception hierarchy for robust error handling, clear error messages for debugging, and automatic retry capabilities with exponential backoff.

**Developer Experience**: Full type hints and TypeScript definitions, extensive documentation with code examples, minimal dependencies for easy integration, and support for both synchronous and asynchronous workflows.

## Installation

### Python SDK

The Python SDK requires Python 3.7 or higher and can be installed using pip:

```bash
pip install manus-gateway
```

For development with testing and formatting tools:

```bash
pip install manus-gateway[dev]
```

### JavaScript SDK

The JavaScript SDK works in both Node.js (version 14+) and modern browsers with native fetch support:

```bash
npm install manus-gateway
```

Or using yarn:

```bash
yarn add manus-gateway
```

## REST API Endpoints

Manus Gateway provides RESTful API endpoints for direct HTTP integration. All endpoints require authentication via the `X-API-Key` header.

### Base URL

All API requests should be made to:
```
https://your-gateway-domain.com/api/v1
```

### Authentication

Include your API key in the `X-API-Key` header:
```bash
curl -H "X-API-Key: manus_your_api_key_here" https://your-gateway-domain.com/api/v1/tasks
```

### Available Endpoints

#### Create Task
**POST** `/api/v1/tasks`

Create a new task with a prompt.

**Request Body:**
```json
{
  "prompt": "Your task description here"
}
```

**Response:**
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

**Example:**
```bash
curl -X POST "https://your-gateway-domain.com/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: manus_your_api_key_here" \
  -d '{"prompt":"Analyze quarterly sales data"}'
```

#### Get Task
**GET** `/api/v1/tasks/:taskUuid`

Retrieve details of a specific task.

**Response:**
```json
{
  "success": true,
  "data": {
    "taskUuid": "TASK-A54CC3B465D47616",
    "prompt": "Analyze quarterly sales data",
    "status": "completed",
    "result": "Analysis complete: Revenue increased by 15%...",
    "errorMessage": null,
    "createdAt": "2025-11-19T15:32:29.000Z",
    "updatedAt": "2025-11-19T15:35:42.000Z"
  }
}
```

**Example:**
```bash
curl -X GET "https://your-gateway-domain.com/api/v1/tasks/TASK-A54CC3B465D47616" \
  -H "X-API-Key: manus_your_api_key_here"
```

#### List Tasks
**GET** `/api/v1/tasks`

Retrieve a paginated list of tasks with optional filtering.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 25) - Items per page
- `status` (optional) - Filter by status: `pending`, `sent`, `processing`, `completed`, `failed`

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "taskUuid": "TASK-A54CC3B465D47616",
        "prompt": "Analyze quarterly sales data",
        "status": "completed",
        "result": "Analysis complete...",
        "errorMessage": null,
        "createdAt": "2025-11-19T15:32:29.000Z",
        "updatedAt": "2025-11-19T15:35:42.000Z"
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

**Example:**
```bash
curl -X GET "https://your-gateway-domain.com/api/v1/tasks?status=completed&page=1&limit=10" \
  -H "X-API-Key: manus_your_api_key_here"
```

### Error Responses

All error responses follow this format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## SDK Authentication

Before using the SDKs, you need to obtain an API key from your Manus Gateway instance. Follow these steps to generate your API key:

1. Log in to your Manus Gateway web interface
2. Navigate to the **API Keys** page from the main navigation
3. Click the **Create Key** button
4. Copy the generated key (it starts with `manus_` and should be kept secure)
5. Store the key securely using environment variables or a secrets management system

**Security Best Practice**: Never hardcode API keys in your source code or commit them to version control. Always use environment variables or secure configuration management.

## Quick Start Examples

### Python Quick Start

```python
import os
from manus_gateway import ManusGatewayClient

# Initialize the client with environment variables
client = ManusGatewayClient(
    api_key=os.environ["MANUS_API_KEY"],
    base_url=os.environ["MANUS_BASE_URL"]
)

# Create a task
task = client.create_task("Analyze the quarterly sales data and provide insights")
print(f"Task created: {task.task_uuid}")
print(f"Status: {task.status}")

# Wait for completion (polls automatically)
completed_task = client.wait_for_completion(
    task.task_uuid,
    poll_interval=10,  # Check every 10 seconds
    max_wait=3600      # Wait up to 1 hour
)

# Process the result
if completed_task.status == "completed":
    print(f"Response: {completed_task.response}")
else:
    print(f"Task failed: {completed_task.error}")
```

### JavaScript Quick Start

```javascript
import { ManusGatewayClient } from 'manus-gateway';

// Initialize the client
const client = new ManusGatewayClient({
  apiKey: process.env.MANUS_API_KEY,
  baseUrl: process.env.MANUS_BASE_URL
});

// Create a task
const task = await client.createTask('Analyze the quarterly sales data');
console.log(`Task created: ${task.task_uuid}`);

// Wait for completion
const completed = await client.waitForCompletion(task.task_uuid, {
  pollInterval: 10000,  // 10 seconds
  maxWait: 3600000      // 1 hour
});

// Process the result
if (completed.status === 'completed') {
  console.log(`Response: ${completed.response}`);
} else {
  console.log(`Task failed: ${completed.error}`);
}
```

## Core Concepts

### Task Lifecycle

Understanding the task lifecycle is crucial for effective integration. Each task progresses through the following states:

**Pending**: The task has been created but not yet sent to Manus. This is the initial state immediately after creation.

**Sent**: The task has been sent to Manus via email and is awaiting acknowledgment. The system is waiting for Manus to begin processing.

**Processing**: Manus has acknowledged the task and is actively working on it. This state indicates that work is in progress.

**Completed**: Manus has finished processing and provided a response. The `response` field contains the result.

**Failed**: The task encountered an error and could not be completed. The `error` field contains details about what went wrong.

### Task Object Structure

Both SDKs return task objects with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `task_uuid` | string | Unique identifier for the task (e.g., "TASK-12345678") |
| `prompt` | string | The original task prompt submitted by the user |
| `status` | string | Current status (pending, sent, processing, completed, failed) |
| `created_at` | string | ISO 8601 timestamp when the task was created |
| `updated_at` | string | ISO 8601 timestamp of the last status update |
| `sent_at` | string or null | ISO 8601 timestamp when sent to Manus (null if not sent) |
| `response` | string or null | Manus's response text (null until completed) |
| `error` | string or null | Error message if failed (null otherwise) |

## Common Use Cases

### Use Case 1: Simple Task Submission

For straightforward tasks where you don't need to wait for completion:

**Python:**
```python
# Create task and store UUID for later retrieval
task = client.create_task("Summarize the attached document")
save_to_database(task.task_uuid)

# Later, check status
task = client.get_task(task_uuid)
if task.status == "completed":
    process_response(task.response)
```

**JavaScript:**
```javascript
// Create task and store UUID
const task = await client.createTask('Summarize the attached document');
await saveToDatabase(task.task_uuid);

// Later, check status
const updatedTask = await client.getTask(taskUuid);
if (updatedTask.status === 'completed') {
  processResponse(updatedTask.response);
}
```

### Use Case 2: Batch Processing

Process multiple tasks efficiently:

**Python:**
```python
# Create multiple tasks
prompts = [
    "Analyze dataset A",
    "Analyze dataset B",
    "Analyze dataset C"
]

tasks = [client.create_task(prompt) for prompt in prompts]
task_uuids = [task.task_uuid for task in tasks]

# Wait for all to complete
import time
while True:
    results = [client.get_task(uuid) for uuid in task_uuids]
    
    if all(t.status in ["completed", "failed"] for t in results):
        break
    
    time.sleep(30)  # Check every 30 seconds

# Process results
for task in results:
    if task.status == "completed":
        print(f"{task.prompt}: {task.response}")
```

**JavaScript:**
```javascript
// Create multiple tasks
const prompts = [
  'Analyze dataset A',
  'Analyze dataset B',
  'Analyze dataset C'
];

const tasks = await Promise.all(
  prompts.map(prompt => client.createTask(prompt))
);

// Wait for all to complete
const results = await Promise.all(
  tasks.map(task => client.waitForCompletion(task.task_uuid))
);

// Process results
results.forEach(task => {
  if (task.status === 'completed') {
    console.log(`${task.prompt}: ${task.response}`);
  }
});
```

### Use Case 3: Error Handling and Retries

Implement robust error handling with automatic retries:

**Python:**
```python
from manus_gateway import ManusGatewayError, AuthenticationError
import time

def create_task_with_retry(client, prompt, max_retries=3):
    """Create a task with exponential backoff retry logic."""
    for attempt in range(max_retries):
        try:
            return client.create_task(prompt)
        except AuthenticationError:
            # Don't retry authentication errors
            raise
        except ManusGatewayError as e:
            if attempt == max_retries - 1:
                raise
            
            wait_time = 2 ** attempt  # Exponential backoff
            print(f"Attempt {attempt + 1} failed, retrying in {wait_time}s...")
            time.sleep(wait_time)

# Usage
try:
    task = create_task_with_retry(client, "Complex analysis task")
except AuthenticationError:
    print("Invalid API key - please check your credentials")
except ManusGatewayError as e:
    print(f"Failed after retries: {e}")
```

**JavaScript:**
```javascript
import { 
  ManusGatewayError, 
  AuthenticationError 
} from 'manus-gateway';

async function createTaskWithRetry(client, prompt, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.createTask(prompt);
    } catch (error) {
      // Don't retry authentication errors
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Usage
try {
  const task = await createTaskWithRetry(client, 'Complex analysis task');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else {
    console.error(`Failed after retries: ${error.message}`);
  }
}
```

### Use Case 4: Pagination and Filtering

Efficiently retrieve and process large numbers of tasks:

**Python:**
```python
# Get all completed tasks across multiple pages
all_completed = []
page = 1

while True:
    result = client.list_tasks(status="completed", page=page, limit=50)
    all_completed.extend(result["tasks"])
    
    if page >= result["totalPages"]:
        break
    
    page += 1

print(f"Found {len(all_completed)} completed tasks")

# Process each completed task
for task in all_completed:
    analyze_response(task.response)
```

**JavaScript:**
```javascript
// Get all completed tasks across multiple pages
const allCompleted = [];
let page = 1;

while (true) {
  const result = await client.listTasks({ 
    status: 'completed', 
    page, 
    limit: 50 
  });
  
  allCompleted.push(...result.tasks);
  
  if (page >= result.totalPages) {
    break;
  }
  
  page++;
}

console.log(`Found ${allCompleted.length} completed tasks`);

// Process each completed task
allCompleted.forEach(task => {
  analyzeResponse(task.response);
});
```

## Advanced Integration Patterns

### Webhook Integration

For production systems, consider using webhooks instead of polling. Configure webhooks in your Manus Gateway settings to receive push notifications when tasks complete:

**Python with Flask:**
```python
from flask import Flask, request
from manus_gateway import ManusGatewayClient

app = Flask(__name__)
client = ManusGatewayClient(
    api_key=os.environ["MANUS_API_KEY"],
    base_url=os.environ["MANUS_BASE_URL"]
)

@app.route('/webhook/task-completed', methods=['POST'])
def handle_webhook():
    data = request.json
    task_uuid = data.get('task_uuid')
    
    # Retrieve full task details
    task = client.get_task(task_uuid)
    
    if task.status == "completed":
        process_completed_task(task)
    
    return {'status': 'ok'}, 200
```

**JavaScript with Express:**
```javascript
import express from 'express';
import { ManusGatewayClient } from 'manus-gateway';

const app = express();
const client = new ManusGatewayClient({
  apiKey: process.env.MANUS_API_KEY,
  baseUrl: process.env.MANUS_BASE_URL
});

app.post('/webhook/task-completed', async (req, res) => {
  const { task_uuid } = req.body;
  
  // Retrieve full task details
  const task = await client.getTask(task_uuid);
  
  if (task.status === 'completed') {
    await processCompletedTask(task);
  }
  
  res.json({ status: 'ok' });
});

app.listen(3000);
```

### Database Integration

Store tasks in your database for tracking and auditing:

**Python with SQLAlchemy:**
```python
from sqlalchemy import Column, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Task(Base):
    __tablename__ = 'tasks'
    
    task_uuid = Column(String(50), primary_key=True)
    prompt = Column(String(1000))
    status = Column(String(20))
    created_at = Column(DateTime)
    response = Column(String(10000), nullable=True)

# Create task and save to database
manus_task = client.create_task("Analyze data")

db_task = Task(
    task_uuid=manus_task.task_uuid,
    prompt=manus_task.prompt,
    status=manus_task.status,
    created_at=datetime.fromisoformat(manus_task.created_at)
)
session.add(db_task)
session.commit()
```

### Background Job Processing

Use task queues for asynchronous processing:

**Python with Celery:**
```python
from celery import Celery
from manus_gateway import ManusGatewayClient

app = Celery('tasks', broker='redis://localhost:6379')
client = ManusGatewayClient(
    api_key=os.environ["MANUS_API_KEY"],
    base_url=os.environ["MANUS_BASE_URL"]
)

@app.task
def create_and_wait_for_task(prompt):
    """Background task to create and wait for completion."""
    task = client.create_task(prompt)
    completed = client.wait_for_completion(task.task_uuid)
    
    # Store result or trigger next action
    store_result(completed)
    return completed.task_uuid

# Usage
result = create_and_wait_for_task.delay("Analyze sales data")
```

## API Reference

### Python SDK

#### ManusGatewayClient

**Constructor:**
```python
ManusGatewayClient(api_key: str, base_url: str, timeout: int = 30)
```

**Methods:**

- `create_task(prompt: str) -> Task`: Create a new task
- `get_task(task_uuid: str) -> Task`: Retrieve task details
- `list_tasks(status: Optional[str] = None, page: int = 1, limit: int = 25) -> Dict`: List tasks with filtering
- `wait_for_completion(task_uuid: str, poll_interval: int = 10, max_wait: int = 3600) -> Task`: Poll until completion

**Exceptions:**

- `ManusGatewayError`: Base exception for all SDK errors
- `AuthenticationError`: Invalid API key or authentication failure
- `TaskNotFoundError`: Task UUID does not exist

### JavaScript SDK

#### ManusGatewayClient

**Constructor:**
```typescript
new ManusGatewayClient(config: {
  apiKey: string,
  baseUrl: string,
  timeout?: number
})
```

**Methods:**

- `createTask(prompt: string): Promise<Task>`: Create a new task
- `getTask(taskUuid: string): Promise<Task>`: Retrieve task details
- `listTasks(options?: { status?: string, page?: number, limit?: number }): Promise<TaskListResponse>`: List tasks
- `waitForCompletion(taskUuid: string, options?: { pollInterval?: number, maxWait?: number }): Promise<Task>`: Poll until completion

**Exceptions:**

- `ManusGatewayError`: Base exception for all SDK errors
- `AuthenticationError`: Invalid API key or authentication failure
- `TaskNotFoundError`: Task UUID does not exist

## Testing

### Python Testing

```python
import pytest
from manus_gateway import ManusGatewayClient

@pytest.fixture
def client():
    return ManusGatewayClient(
        api_key="test_key",
        base_url="https://test.example.com"
    )

def test_create_task(client, mocker):
    # Mock the API response
    mock_response = {
        "task_uuid": "TASK-12345678",
        "prompt": "Test task",
        "status": "pending",
        "created_at": "2024-11-19T00:00:00Z",
        "updated_at": "2024-11-19T00:00:00Z",
        "sent_at": None,
        "response": None,
        "error": None
    }
    
    mocker.patch.object(client, '_make_request', return_value=mock_response)
    
    task = client.create_task("Test task")
    assert task.task_uuid == "TASK-12345678"
    assert task.status == "pending"
```

### JavaScript Testing

```javascript
import { ManusGatewayClient } from 'manus-gateway';

describe('ManusGatewayClient', () => {
  let client;

  beforeEach(() => {
    client = new ManusGatewayClient({
      apiKey: 'test_key',
      baseUrl: 'https://test.example.com'
    });
  });

  it('should create a task', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          result: {
            data: {
              task_uuid: 'TASK-12345678',
              prompt: 'Test task',
              status: 'pending',
              created_at: '2024-11-19T00:00:00Z',
              updated_at: '2024-11-19T00:00:00Z',
              sent_at: null,
              response: null,
              error: null
            }
          }
        })
      })
    );

    const task = await client.createTask('Test task');
    expect(task.task_uuid).toBe('TASK-12345678');
    expect(task.status).toBe('pending');
  });
});
```

## Troubleshooting

### Common Issues and Solutions

**Issue: Authentication Error**

**Symptom:** `AuthenticationError: Invalid API key`

**Solution:** Verify that your API key is correct and starts with `manus_`. Check that you're using the correct base URL for your Manus Gateway instance. Ensure the API key hasn't been revoked in the web interface.

**Issue: Connection Timeout**

**Symptom:** Request timeout errors or network failures

**Solution:** Increase the timeout parameter when initializing the client. Check your network connectivity and firewall settings. Verify that the base URL is accessible from your environment.

**Issue: Task Not Found**

**Symptom:** `TaskNotFoundError` when retrieving a task

**Solution:** Verify the task UUID is correct (case-sensitive). Ensure the task was created successfully before attempting to retrieve it. Check that you're using the correct client instance (same base URL).

**Issue: Slow Polling**

**Symptom:** `wait_for_completion` takes too long or times out

**Solution:** Adjust the `poll_interval` to check more frequently. Increase `max_wait` if tasks legitimately take longer. Consider using webhooks instead of polling for better performance.

## Best Practices Summary

The following best practices will help you build robust and maintainable integrations:

**Security**: Always use environment variables for API keys, never commit credentials to version control, rotate API keys periodically, and use HTTPS for all API communications.

**Error Handling**: Implement comprehensive try-catch blocks, use exponential backoff for retries, log errors with sufficient context for debugging, and handle different error types appropriately.

**Performance**: Use webhooks instead of polling when possible, implement batch operations for multiple tasks, cache task results when appropriate, and use appropriate timeout values.

**Reliability**: Implement retry logic with exponential backoff, store task UUIDs for later retrieval, monitor API usage and rate limits, and implement circuit breakers for production systems.

**Maintainability**: Use type hints and TypeScript for better IDE support, write comprehensive tests for your integration, document your integration patterns, and keep SDKs updated to the latest version.

## Support and Resources

For additional help and resources:

- **API Documentation**: Refer to `API_GUIDE.md` for detailed REST API documentation
- **Setup Guide**: See `SETUP.md` for initial configuration instructions
- **GitHub Issues**: Report bugs or request features at the SDK repository
- **Email Support**: Contact support@manus.im for technical assistance

## License

Both SDKs are released under the MIT License. See the LICENSE file in each SDK directory for full details.

---

**Last Updated**: November 19, 2024  
**SDK Version**: 1.0.0  
**Author**: Manus AI
