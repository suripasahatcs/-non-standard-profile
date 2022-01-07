const fs = require('fs')
  , path = require('path')
  , core = require('@actions/core')
  , io = require('@actions/io')
  , OrganizationActivity = require('./src/githublib/OrgsUserActivity')
  , githubClient = require('./src/githublib/githubClient')
  
  , OrgsssActivity = require('./src/githublib/api')
;

async function run() {
  const token = getRequiredInput('token')
    , outputDir = getRequiredInput('outputDir')
    , organizationinp = getRequiredInput('organization')
    , maxRetries = getRequiredInput('octokit_max_retries')
  ;


  let regex = /^[\w\.\_\-]+((,|-)[\w\.\_\-]+)*[\w\.\_\-]+$/g;
  let validate_org = regex.test(organizationinp);
  if((!validate_org)) {
    throw new Error('Provide a valid organization - It accept only comma separated value');
  }
  
  // Ensure that the output directory exists before we our limited API usage
  await io.mkdirP(outputDir)

  const octokit = githubClient.create(token, maxRetries)
    , orgActivity = new OrganizationActivity(octokit)
  ;

  //***start */
  let organizationlist = organizationinp.split(',');
  let removeMulUserList = [];
  let jsonfinallist = [];
  let rmvconfrm = 0;
  for(const organization of organizationlist){
    console.log(`Attempting to generate ${organization} - user activity data, this could take some time...`);
    const orgsComments = await orgActivity.getOrgsValid(organization);
    console.log(orgsComments)
    if(orgsComments.status !== 'error') {
      jsonfinallist = await orgActivity.getUserActivity(organization);
      
    }
  }

  // console.log('******output*******')
  // console.log(removeMulUserList);
  console.log('******final*******')
  console.log(jsonfinallist);
  
  
  //***end test */

  console.log(`User activity data captured, generating inactive user report... `);

 
  const totalInactive = jsonfinallist.length;

  core.setOutput('jsonfinallist', jsonfinallist);
  core.setOutput('usercount', totalInactive);
  if(totalInactive === totalInactive){
    core.setOutput('message', 'Success');
  }else{
    core.setOutput('message', 'Failure');
  }
}

async function execute() {
  try {
    await run();
  } catch (err) {
    core.setFailed(err.message);
  }
}
execute();


function getRequiredInput(name) {
  return core.getInput(name, {required: true});
}



function saveIntermediateData(directory, data) {
  try {
    const file = path.join(directory, 'organization_removed_users.json');
    fs.writeFileSync(file, JSON.stringify(data));
    core.setOutput('report_json', file);
  } catch (err) {
    console.error(`Failed to save intermediate data: ${err}`);
  }
}