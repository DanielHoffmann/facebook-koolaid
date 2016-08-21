import express from 'express';
let router = express.Router();
import {ensureLoggedIn} from 'connect-ensure-login';
import db from '../../models/index';
import graphqlHTTP from 'express-graphql';

let gqlOptions = {
   schema: db.schema
};

//Skip auth on developemnt env
if (process.env.NODE_ENV === 'development') {
   gqlOptions.graphiql = true;
   gqlOptions.pretty = true;
} else {
   router.all('*', ensureLoggedIn('/api/users/login_fail'));
}

router.use('/graphql', graphqlHTTP(gqlOptions));

export default router;
