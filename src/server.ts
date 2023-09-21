// Copyright 2023 Daniel C. Brotsky. All rights reserved.
// Licensed under the GNU Affero General Public License v3.
// See the LICENSE file for details.

import express from 'express'

import {loadSettings} from './settings.js'
import {getTsmlFeed} from "./routes.js";

const PORT = process.env.PORT || 5001;

loadSettings()

express()
    .use(express.json())
    .get('/api/tsml', asyncWrapper(getTsmlFeed))
    .listen(PORT, () => console.log(`Listening on port ${PORT}`))

type Handler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>

function asyncWrapper(handler: Handler) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            await handler(req, res, next)
        }
        catch (error) {
            console.log(`Route handler produced an error: ${error}`)
            res.status(500).send({ status: 'error', reason: `Server error: ${error}`})
        }
    }
}