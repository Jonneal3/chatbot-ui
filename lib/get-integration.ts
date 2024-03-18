import { getConnectionById } from "@/db/connections"

const getOauthObject = async (connection_id: any) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NANGO_SECRET_KEY_PROD
    if (!apiKey) {
      throw new Error("NANGO_API_KEY not found in environment variables")
    }

    const providerConfigKey = await getConnectionById(connection_id)
    const connectionId = connection_id

    const url = `https://api.nango.dev/connection/${connectionId}?provider_config_key=${providerConfigKey.integration_id}&force_refresh=true&refresh_token=true`

    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` }
    }

    const response = await fetch(url, options)
    const data = await response.json()

    return { data }
  } catch (error) {
    console.error("Error fetching data from Nango API:", error)
    throw new Error("Error fetching data from Nango API")
  }
}

console.log({ oauth: getOauthObject })

export default getOauthObject
