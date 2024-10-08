import { ApolloClient, InMemoryCache } from "@apollo/client"

export const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})
