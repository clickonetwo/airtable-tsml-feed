// Copyright 2023 Daniel C. Brotsky. All rights reserved.
// Licensed under the GNU Affero General Public License v3.
// See the LICENSE file for details.

import assert from 'assert'

import {getSettings, loadSettings} from './settings.js'
import {getBase, getAllRecords} from "./airtable.js";

async function testGetMeetingsForExport() {
    const config = getSettings()
    const base = await getBase(config.meetingsBaseId)
    const records = await getAllRecords(base, config.meetingsTableId, 'TSML Export')
    console.log(`Fetched ${records.length} records`)
}

async function testAll(...tests: string[]) {
    loadSettings('test')
    if (tests.length == 0) {
        tests = ['get']
    }
    if (tests.includes('get')) {
        await testGetMeetingsForExport()
    }
    assert(tests.length > 0, "You need to add some tests!")
}

testAll(...process.argv.slice(2))
    .then(() => console.log("Tests completed with no errors"))
