import ApolloClient, { InMemoryCache } from "apollo-boost"
import Vue from "vue"

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  uri: "/graphql",
  credentials: "include",
  cache
})

Object.defineProperties(Vue.prototype, {
  $apollo: {
    get() {
      return apolloClient
    }
  }
})

export default apolloClient
