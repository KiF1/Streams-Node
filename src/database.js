import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.writeFile(databasePath, '').then(() => {
      this.#database = {};
    }).catch(() => {
      this.#persist();
    });    
  }
    

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
      let data = this.#database[table] ?? []
      
      if(search){
        data = data.filter(row => {
          return Object.entries(search).some((key, value) => {
            return row[key].toLowerCase().includes[value.toLowerCase()]
          })
        })
      }
      
      return data
  }

  insert(table, data) {
      if(Array.isArray(this.#database[table])){
        this.#database[table].push(data)
      }else{
        this.#database[table] = [data]
      }
      return data
  }

  delete(table, id){
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if(rowIndex > -1){
      this.#database[table].splice(rowIndex, 1)
      this.#persist();
    }else{
      throw new Error('ID não encontrado');
    }
  }

  update(table, id, title, description) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);
    if (rowIndex > -1) {
      if (title) {
        this.#database[table][rowIndex].title = title;
      }
      if (description) {
        this.#database[table][rowIndex].description = description;
      }
      
      this.#database[table][rowIndex].updated_at = new Date();
      this.#persist();
    }else{
      throw new Error('ID não encontrado');
    }
  }

  updateTaskCompleted(table, id, date){
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if(rowIndex > -1){
      const task = this.#database[table][rowIndex];
      task.completed_at = date;
      task.updated_at = new Date();
      this.#persist();
    }else{
      throw new Error('ID não encontrado');
    }
  }
}