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
    let activityResults = [];
    let nonstduserlogin = [];
    let nonstduseremail = [];
    for(let idx = 0; idx< orgUsers.length; idx++) 
    {
      
      const repoActivity = await self.organizationClient.findNonstdUsers(orgUsers[idx]['login']);
        {
                if((orgUsers[idx]['login'].company != 'TCS') || (orgUsers[idx]['login'].email == 'null') ||  (orgUsers[idx]['login'].public_repos != 0) || (orgUsers[idx]['login'].login != 'null') )
                {
                  nonstduserlogin.push(login)
                }
                if( (orgUsers[idx]['login'].email != 'null') )
                {
                  nonstduseremail.push(email)
                }
                // if(email == 'null')
                // {
                //   throw new Error("Please provide correct email")
                // }
                // if(public_repos != 0)
                // {
                //   throw new Error("Your profile contains public repository")
                // }
                // let regex = /^[0-9]{6,6}$/
                // let validate_login = regex.test(login);
                // if((!validate_login)){
                //   throw new Error("Your PSID is incorrect")
                // }
        }

                activityResults =[  activityResults, ...repoActivity];
                nonstduserlogin =[  nonstduserlogin, ...repoActivity];
                nonstduseremail =[  nonstduseremail, ...repoActivity];
    }


    console.log(activityResults)

    // An array of user activity objects
    return Object.values(activityResults);
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
