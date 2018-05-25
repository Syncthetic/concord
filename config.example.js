const config = {
  discord: {
    auth_key: 'Your discord bot auth key'
  },
  WIT_AI: {
    key: 'Your wit.ai api key'
  },
  cve: {
    // You can enable dev mode in discord to get channel ID's,
    // alternatively, you can use the API to post the channel ID by modifying some code
    broadcast_channel_id: 'Channel ID that new CVEs will be posted to',

    // Add a list of files the CVE class may use (will be created)
    // Currently there is only 1 file, with the latest cve vulns
    FILES: {
      'latest': './.cve_latest.txt'
    }
  },
  youtube: {
    search_key: 'Youtube search api key'
  }
 }
 
 module.exports = config;