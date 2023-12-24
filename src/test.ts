// Copyright 2023 Daniel C. Brotsky. All rights reserved.
// Licensed under the GNU Affero General Public License v3.
// See the LICENSE file for details.

import assert from 'assert'

import {getSettings, loadSettings} from './settings.js'
import {getBase, getAllRecords} from "./airtable.js";
import {dateToUpdated, recordToTsml} from "./tsml.js";

async function testGetMeetingsForExport() {
    const config = getSettings()
    const base = await getBase(config.meetingsBaseId)
    const records = await getAllRecords(
        base, config.meetingsTableId, { view: 'TSML Export', maxRecords: 3 })
    assert(records.length == 3, `Fetched ${records.length} records but expected 3`)
}

async function testTsmlExport() {
    const config = getSettings()
    const base = await getBase(config.meetingsBaseId)
    const records = await getAllRecords(
        base, config.meetingsTableId, { view: 'TSML Export' })
    const startAfter = records.filter((r) => r.get('Start Date'))
    if (startAfter.length > 0) {
        process.env["TSML_RUN_DATETIME_MILLIS"] = new Date(2020, 0, 1).valueOf().toString()
        const startExports = startAfter.filter(recordToTsml)
        assert(startExports.length == 0, "Records were exported before start date")
        delete process.env["TSML_RUN_DATETIME_MILLIS"]
    } else {
        console.log(`Can't run test for now before start date`)
    }
    const startAfterEdit = records.filter(
        (r) => r.get('Start Date') && r.get('Start Date')! > r.get('Last Edit')!
    )
    if (startAfterEdit.length > 0) {
        const first = startAfterEdit[0]
        process.env["TSML_RUN_DATETIME_MILLIS"] = new Date(first.get('Start Date') as string).valueOf().toString()
        const tsml = recordToTsml(first)
        delete process.env["TSML_RUN_DATETIME_MILLIS"]
        assert(tsml !== undefined && tsml["updated"] === dateToUpdated(first.get('Start Date') as string))
    } else {
        console.log(`Can't run test for start date > last edit date`)
    }
    const endBefore = records.filter((r) => r.get('End Date'))
    if (endBefore.length > 0) {
        process.env["TSML_RUN_DATETIME_MILLIS"] = new Date(2100, 1, 1).valueOf().toString()
        const endExports = endBefore.filter(recordToTsml)
        assert(endExports.length == 0, "Records were exported after end date")
        delete process.env["TSML_RUN_DATETIME_MILLIS"]
    } else {
        console.log(`Can't run test for now after end date`)
    }
    const exports = records.map(recordToTsml)
    assert(exports.length <= records.length)
}

async function testAll(...tests: string[]) {
    loadSettings('test')
    if (tests.length == 0) {
        tests = ['get', 'tsml']
    }
    if (tests.includes('get')) {
        await testGetMeetingsForExport()
    }
    if (tests.includes('tsml')) {
        await testTsmlExport()
    }
}

testAll(...process.argv.slice(2))
    .then(() => console.log("Tests completed with no errors"))
