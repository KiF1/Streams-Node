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
  
      if (req.headers['Content-type'] && req.headers['Content-type'].includes('multipart/form-data')) {
        const form = formidable();
  
        form.parse(req, async (err, fields, files) => {
          if (files && files.csv) {
            const stream = fs.createReadStream(files.csv.path);
  
            const linesParse = stream.pipe(csv({ separator: ',' }));
  
            for await (const line of linesParse) {
              const { title, description } = line;
              const task = {
                id: randomUUID(),
                completed_at: null,
                title,
                description,
                created_at: new Date(),
                updated_at: new Date(),
              }
  
              database.insert('tasks', task);
            }
          }
  
          return res.writeHead(201).end();
        });
      } else {
        const { title, description } = req.body
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
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      try {
        const { id } = req.params;
        const { title, description } = req.body;
        database.update('tasks', id, title, description)
        return res.writeHead(204).end();
      } catch {
        return res.status(500).send('Id não encontrado');
      }
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      try {
        const { id } = req.params;
        const date = new Date();
        database.updateTaskCompleted('tasks', id, date);
        return res.writeHead(204).end();
      } catch {
        return res.status(500).send('Id não encontrado');
      }
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      try{
        const { id } = req.params;
        database.delete('tasks', id)
        return res.writeHead(204).end()
      } catch {
        return res.status(500).send('Id não encontrado');
      }
    }
  },
]