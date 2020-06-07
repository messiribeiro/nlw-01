import knex from '../database/connection';
import {Request, Response} from 'express'

class itemsController {
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');

        const seriaLizedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.1.101:3333/uploads/${item.image}`
            }
        })
    
        return response.json(seriaLizedItems);
    }
}

export default itemsController;