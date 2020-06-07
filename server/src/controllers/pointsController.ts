import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))

        const points = await knex('points')
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const seriaLizedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.1.101:3333/uploads/${point.image}`
            }
        })


        return response.json(seriaLizedPoints)
    }

    async show(request: Request, response: Response) {
        const { id } = request.params

        const point = await knex('points').where('id', id).first()

        if (!point) {
            return response.status(400).json({ point: "not found" })
        }

        const seriaLizedPoint =  {
                ...point,
                image_url: `http://192.168.1.101:3333/uploads/${point.image}`
            }
        

        console.log(id);

        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id)
            .select('items.title');

        return response.json({ seriaLizedPoint, items });

    }


    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        }
        const inserted_id = await trx('points').insert(point);

        const point_id = inserted_id[0];


        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {

                return {
                    item_id,
                    point_id,
                }
            })
        await trx('points_items').insert(pointItems);

        await trx.commit();

        return response.json({
            id: point_id,
            ...point
        })
    }


}

export default PointsController;