import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { randomUUID } from 'node:crypto'

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path:buildRoutePath('/tasks'),
     handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null)
      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
        const { title, description } = req.body;

        if (!title) {
          return res.writeHead(400).end(
            JSON.stringify({ message: 'title is required' }),
          )
        }
  
        if (!description) {
          return res.writeHead(400).end(
            JSON.stringify({message: 'description is required' })
          )
        }

        const task = {
          id: randomUUID(),
          completed_at: null,
          title,
          description,
          created_at: new Date(),
          updated_at: new Date(),
        }
  
        database.insert('tasks', task);
        return res.writeHead(201).end();
      }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params;
        const { title, description } = req.body;
        const [task] = database.select('tasks', { id });

        if (!title || !description) {
          return res.writeHead(400).end(
            JSON.stringify({ message: 'title or description are required' })
          )
        }

        if (!task) {
          return res.writeHead(404).end()
        }

        database.update('tasks', id, title, description)
        return res.writeHead(204).end();
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
        const { id } = req.params;
        const [task] = database.select('tasks', { id })
        const date = new Date();

        if (!task) {
          return res.writeHead(404).end()
        }

        database.updateTaskCompleted('tasks', id, date);
        return res.writeHead(204).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params;const [task] = database.select('tasks', { id })

        if (!task) {
          return res.writeHead(404).end()
        }

        database.delete('tasks', id)
        return res.writeHead(204).end()
    }
  },
]