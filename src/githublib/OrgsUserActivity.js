const Organization = require('./api');
module.exports = class OrganizationUserActivity {

  constructor(octokit) {
    this._organization = new Organization(octokit);
  }

  get organizationClient() {
    return this._organization;
  }

  async getUserActivity(org) {
    const self = this;

    const orgUsers = await self.organizationClient.findUsers(org);
    console.log(orgUsers)
    const activityResults = {};
    for(let idx = 0; idx< orgUsers.length; idx++) {
      const repoActivity = await self.organizationClient.findNonstdUsers(orgUsers[idx]);
    console.log(repoActivity)

      Object.assign(activityResults, repoActivity);
    }


    console.log(activityResults)

    // An array of user activity objects
    // return Object.values(activityResults);
  }

   async getOrgsValid (org) {
    const self = this;
    const orgsValid = await self.organizationClient.getOrgs(org);

    return orgsValid;
    
  }
}

function generateUserActivityData(data) {
  if (!data) {
    return null
  }

  // Use an object to ensure unique user to activity based on user key
  const results = {};

  function process(repo, values, activityType) {
    if (values) {
      Object.keys(values).forEach(login => {
        if (!results[login]) {
          results[login] = new UserActivity(login);
        }

        results[login].increment(activityType, repo, values[login]);
      })
    }
  }

  Object.keys(data).forEach(repo => {
    const activity = data[repo];
    Object.keys(activity).forEach(activityType => {
      process(repo, activity[activityType], activityType)
    });
  });

  return results;
}
