import {Amplify} from 'aws-amplify';
import {generateClient} from "@aws-amplify/api";
import {getUser} from "@/graphql/queries";

Amplify.configure({
    API: {
        GraphQL: {
            endpoint: process.env.AWS_AMPLIFY_GRAPHQL_ENDPOINT as string,
            region: 'eu-west-2',
            defaultAuthMode: 'apiKey',
            apiKey: process.env.AWS_AMPLIFY_GRAPHQL_KEY
        }
    }
});

export const getUserGraph = async (uid: string) => {

    const client = generateClient()

    return await client.graphql({
        query: getUser,
        variables: {uid}
    })

}