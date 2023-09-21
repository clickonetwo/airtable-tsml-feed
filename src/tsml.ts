import {FieldSet, Record} from 'airtable';

interface Tsml {
    name: string,                   // meeting name
    slug: string,                   // slug for detail page
    day: number,                    // 0 = Sunday, 1 = Monday, etc.
    time: string,                   // 24-hour time with colon
    end_time?: string,              // 24-hour time with colon
    timezone?: string,              // timezone name (e.g., America/Los_Angeles)
    types?: string[],               // list of type codes (see `characteristicToCodeTable`)
    notes?: string,                 // meeting format notes
    conference_url?: string         // URL for online meeting
    conference_url_notes?: string   // online attendee instructions
    location?: string,              // building for in-person meeting
    location_notes?: string,        // in-person attendee instructions
    address?: string,               // building address for in-person meeting
    city?: string,                  // city for all meetings
    state?: string,                 // state for all meetings
    postal_code?: string,           // postal code for all meetings
    country?: string,               // country for all meetings
    group?: string,                 // affiliated meeting group
    email?: string,                 // publicly available email for group
    updated?: string,               // UTC last update date (format YYYY-MM-DD HH:MM:SS)
}

export function recordToTsml(record: Record<FieldSet>) {
    function getOrDefault<T>(name: string, defaultValue?: T) {
        let value: unknown = record.get(name)
        if (value === undefined) {
            if (defaultValue !== undefined) {
                value = defaultValue
            } else {
                throw Error(`Missing value for ${name} in record ${JSON.stringify(record)}`)
            }
        }
        return value as T
    }
    const name = getOrDefault<string>('Name')
    const slug = getOrDefault<string>('TSML Slug')
    const day = dayToNumber(getOrDefault<string>('Day of Week'))
    const time = getOrDefault<string>('Start Time')
    const end_time = getOrDefault<string>('End Time')
    const timezone = timezoneToDesignator(getOrDefault<string>('Time Zone'))
    const types = getOrDefault<string[]>('Characteristics').map((c) => characteristicToCode(c))
    const notes = getOrDefault<string>('Format', '')
    const conference_url = getOrDefault<string>('Attendee URL', '')
    const conference_url_notes = getOrDefault<string>('Attendee Instructions', '')
    const location = getOrDefault<string>('In-Person Building', '')
    const location_notes = getOrDefault<string>('In-Person Directions', '')
    const address = getOrDefault<string>('In-Person Address', '')
    const city = getOrDefault<string>('City')
    const state = getOrDefault<string>('State/Province')
    const country = getOrDefault<string>('Country')
    const email = getOrDefault<string>('Public Contact Email', '')
    const updated = dateToUpdated(getOrDefault<string>('Last Edit'))
    const tsml: Tsml = {
        name, slug,
        day, time, end_time, timezone,
        types, notes,
        conference_url, conference_url_notes, location, location_notes,
        address, city, state, country,
        email, updated
    }
    return tsml
}

type LookupTable<T> = { [name: string]: T }

const characteristicToCodeTable: LookupTable<string> = {
    'Adult Children': 'AC',
    'Al-Anon': 'ALA',
    'Alateen': 'Y',
    'Atheist / Agnostic': 'A',
    'Asian': 'AS',
    'Child Care Available': 'BA',
    'Beginners': 'BE',
    'BIPOC': 'BIPOC',
    'Concurrent with AA Meeting': 'AA',
    'Concurrent with Alateen Meeting': 'AL',
    'English': 'EN',
    'Families Friends and Observers Welcome': 'O',
    'Families and Friends Only': 'C',
    'Fragrance Free': 'FF',
    'Gay': 'G',
    'Lesbian': 'L',
    'LGBTQIA+': 'LGBTQIA',
    'Location Temporarily Closed': 'TC',
    'Men': 'M',
    'Online Meeting': 'ONL',
    'Parents': 'POA',
    'People of Color': 'POC',
    'Smoking Permitted': 'SM',
    'Spanish': 'S',
    'Speaker': 'SP',
    'Step Meeting': 'ST',
    'Transgender': 'T',
    'Wheelchair Accessible': 'X',
    'Women': 'W',
    'Young Adults': 'YA',
}

function characteristicToCode(characteristic: string) {
    return lookupOrThrow<string>(characteristic, characteristicToCodeTable)
}

const dayToNumberTable: LookupTable<number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
}

function dayToNumber(day: string) {
    return lookupOrThrow<number>(day, dayToNumberTable)
}

const timezoneToDesignatorTable: LookupTable<string> = {
    'Pacific Time': 'America/Los_Angeles',
    'Arizona Time': 'America/Phoenix',
    'Mountain Time': 'America/Denver',
    'Central Time': 'America/Chicago',
    'Eastern Time': 'America/New_York',
    'Atlantic Time': 'America/Halifax',
    'Puerto Rico Time': 'America/Puerto_Rico',
}

function timezoneToDesignator(name: string) {
    return lookupOrThrow<string>(name, timezoneToDesignatorTable)
}

function dateToUpdated(isoDate: string) {
    const parsed = Date.parse(isoDate)
    const date = new Date(parsed)
    // want format YYYY-MM-DD HH:MM:SS
    function pad2(posNum: number) {
        return posNum < 10 ? `0${posNum}` : `${posNum}`
    }
    const year = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth())}-${pad2(date.getUTCDate())}`
    const time = `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`
    return `${year} ${time}`
}

function lookupOrThrow<T>(name: string, table: LookupTable<T>): T {
    const code = table[name]
    if (code === undefined) {
        throw Error(`Unknown name: ${name}`)
    }
    return code
}