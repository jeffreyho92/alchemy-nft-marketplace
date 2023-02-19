import "../styles/globals.css"
import { Provider } from "react-redux"
import { wrapper } from "../store/store"
import { ApolloProvider } from "@apollo/client"
import { apolloClient } from "../utils/ApolloClient"

function MyApp({ Component, ...rest }) {
    const { store, props } = wrapper.useWrappedStore(rest)
    return (
        <Provider store={store}>
            <ApolloProvider client={apolloClient}>
                <Component {...props.pageProps} />
            </ApolloProvider>
        </Provider>
    )
}

export default MyApp
