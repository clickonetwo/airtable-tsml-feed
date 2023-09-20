// Copyright 2023 Daniel C. Brotsky. All rights reserved.
// Licensed under the GNU Affero General Public License v3.
// See the LICENSE file for details.

import { config } from 'dotenv'

interface Settings {
    airtableToken: string,
    meetingsBaseId: string,
    meetingsTableId: string,
}

let loadedConfig: Settings | undefined

export function getSettings() {
    if (!loadedConfig) {
        throw Error(`You must load settings before you get them.`)
    }
    return loadedConfig
}

export function loadSettings(name: string = 'env') {
    name = name.toLowerCase()
    if (name === 'env') {
        loadedConfig = envSettings()
    } else if (name === 'test') {
        loadedConfig = testSettings()
    } else {
        throw Error(`Can't load a config named ${name}`)
    }
}

function envSettings(): Settings {
    config()
    const fromEnv = {
        airtableToken: process.env['AIRTABLE_TOKEN'],
        meetingsBaseId: process.env['MEETINGS_BASE_ID'],
        meetingsTableId: process.env['MEETINGS_TABLE_ID']
    }
    for (const key in fromEnv) {
        if (!fromEnv[key]) {
            throw Error(`Can't find needed config ${key} in the environment`)
        }
    }
    return fromEnv as Settings
}

function testSettings(): Settings {
    return envSettings()
}
