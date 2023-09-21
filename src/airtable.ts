import Airtable, {FieldSet, Record} from 'airtable'
import {getSettings} from "./settings.js";
import {AirtableBase} from "airtable/lib/airtable_base.js";
import {QueryParams} from "airtable/lib/query_params.js";

const loadedBases: { [name: string]: AirtableBase } = {}
let airtableConfigured = false

export async function getBase(baseId: string) {
    if (loadedBases?.baseId) {
        return loadedBases.baseId
    }
    if (!airtableConfigured) {
        const config = getSettings()
        Airtable.configure({
            apiKey: config.airtableToken,
            requestTimeout: 30000,
        })
        airtableConfigured = true
    }
    const base = Airtable.base(baseId)
    loadedBases[baseId] = base
    return base
}

export async function getAllRecords(base: AirtableBase, tableId: string, options: QueryParams<object>) {
    const allRecords: Record<FieldSet>[] = []
    try {
        await base.table(tableId)
            .select(options)
            .eachPage(
                (records, processNextPage) => {
                    console.log(`Fetched ${records.length} record(s)...`);
                    records.forEach((record) => {
                        allRecords.push(record);
                    });
                    processNextPage();
                })
    } catch (err) {
        console.error(`Failed to fetch records: ${err}`)
        throw err
    }
    return allRecords
}