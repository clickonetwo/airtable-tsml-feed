// Copyright 2023 Daniel C. Brotsky. All rights reserved.
// Licensed under the GNU Affero General Public License v3.
// See the LICENSE file for details.

import assert from 'assert'

import {getSettings, loadSettings} from './settings.js'
import {getBase, getAllRecords} from "./airtable.js";
import {recordToTsml} from "./tsml.js";

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
    const exports = records.map(recordToTsml)
    assert(exports.length == records.length)
    console.log(`Exports are: \n${JSON.stringify(exports, null, 4)}`)
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
