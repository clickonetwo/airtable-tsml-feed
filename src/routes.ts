import {Request, Response} from "express";
import {getAllRecords, getBase} from "./airtable.js";
import {getSettings} from "./settings.js";
import {Tsml, recordToTsml} from "./tsml.js";

export async function getTsmlFeed(req: Request, res: Response) {
    const config = getSettings()
    const base = await getBase(config.meetingsBaseId)
    const tableId = req.query.tableId as string ?? config.meetingsTableId
    const district = req.query.district as string ?? config.meetingsDistrict
    const options = { filterByFormula: `{District} = "${district}"` }
    const records = await getAllRecords(base, tableId, options)
    const exports: Tsml[] = []
    for (const record of records) {
        const tsml = recordToTsml(record)
        if (tsml !== undefined) {
            exports.push(tsml)
        }
    }
    res.status(200).send(exports)
}