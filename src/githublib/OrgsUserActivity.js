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
    let nonstduserattribute = [];
    for(let idx = 0; idx< orgUsers.length; idx++) 
    {
      
      const repoActivity = await self.organizationClient.findNonstdUsers(orgUsers[idx]['login']);
        {       nonstduseremail.push(repoActivity.email)
                if((orgUsers[idx]['company'] != 'TCS'))
                {
                 
                  nonstduserlogin.push(orgUsers[idx]['login'])
                  nonstduserattribute.push(orgUsers[idx]['company'])
                  // nonstduseremail.push(repoActivity.email)
                  

                }
                // if( (activityResults.email != 'null') )
                // {
                //   nonstduseremail.push(activityResults.email)
                // }
              
                // if(public_repos > 0)
                // {
                //   nonstduseremail.push('public_repos')
                // }
                //  let regex = /^[0-9]{6,6}$/
                //  let validate_login = regex.test(orgUsers[idx]['login']);
                //  if((!validate_login)){
                //   nonstduseremail.push('login')
                //  }
                console.log('******email*******')
                 console.log(nonstduseremail)
                 console.log('******login*******')
                 console.log(nonstduserlogin)
                 console.log('******attribute*******')
                 console.log(nonstduserattribute)

        }

                activityResults =[  activityResults, ...nonstduseremail];
          
    }

    console.log('******activityResults*******')
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
