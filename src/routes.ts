import {Request, Response} from "express";
import {getAllRecords, getBase} from "./airtable.js";
import {getSettings} from "./settings.js";
import {Tsml, recordToTsml} from "./tsml.js";

export async function getTsmlFeed(_req: Request, res: Response) {
    const config = getSettings()
    const base = await getBase(config.meetingsBaseId)
    const records = await getAllRecords(
        base, config.meetingsTableId, { view: 'TSML Export' })
    const exports: Tsml[] = []
    for (const record of records) {
        const tsml = recordToTsml(record)
        if (tsml !== undefined) {
            exports.push(tsml)
        }
    }
    res.status(200).send(exports)
}