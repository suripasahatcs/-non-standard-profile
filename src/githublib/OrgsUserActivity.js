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
    //const nonstd = await self.organizationClient.findNonstdUsers(org);
    let activityResults = [];
    let nonstduserlogin = [];
    let nonstduseremail = [];
    let nonstduserattribute = [];
    let repoActivity = [];
    let finalres =[];
    
    //   repoActivity2 = await self.organizationClient.findNonstdUsers(orgUsers[1]['login']);
    //   console.log(repoActivity1)
    //   console.log(repoActivity2)

    for(let idx = 0; idx< orgUsers.length; idx++) 
    {
      
      repoActivity = await self.organizationClient.findNonstdUsers(orgUsers[idx]['login']);
      //nonstduseremail.push(orgUsers[idx]['node_id'])
      
      console.log('******repoActivityLength*******')
      
        {   console.log('******repoActivity*******')
         console.log(repoActivity)
         let j = 0;
          nonstduserlogin.push(repoActivity[j]['email'])
          console.log('*****************')
          if((repoActivity[j]['company'] != 'TCS'))
          {
           
            // nonstduserlogin.push(repoActivity[j]['login'])
            nonstduserattribute.push('company')
            // nonstduseremail.push(repoActivity.email)
            

          }
          if( (repoActivity[j]['email'] != 'null') )
          {
            nonstduserattribute.push('email')
          }
        
          if(repoActivity[j]['public_repos'] > 0)
          {
            nonstduserattribute.push('public_repos')
          }
           let regex = /^[0-9]{6,6}$/
           let validate_login = regex.test(repoActivity[j]);
           if((!validate_login)){
            nonstduserattribute.push('login')
           }
         
       
         
        repoActivity = [repoActivity,...{nonstduser:nonstduserattribute,message: 'non std user'}];

         finalres.push(repoActivity)
                
                console.log('******non std*******')
                 console.log(nonstduserattribute)
                //  console.log('******login*******')
                //  console.log(nonstduserlogin)
                //  console.log('******publicrepos*******')
                //  console.log(nonstduserattribute)

        }

               // activityResults =[  activityResults, ...nonstduseremail];
          
    }

    console.log('******final*******')
    console.log(finalres)

    // An array of user activity objects
    return Object.values(finalres);
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
