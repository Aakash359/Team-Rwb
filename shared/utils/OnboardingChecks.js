function getMissingInfoSections(user) {
  let personalComplete = true;
  let militaryComplete = true;
  let privacyComplete = true;
  if (
    !user.email ||
    !user.email_verified ||
    !user.location.address ||
    !user.first_name ||
    !user.last_name
  )
    personalComplete = false;
  if (user.military_branch === 'n/a' && user.military_status !== 'Civilian')
    militaryComplete = false;
  if (
    // !user.military_specialty currently not used
    user.military_status !== 'Civilian' &&
    (!user.military_rank ||
      user.has_disability === undefined ||
      user.combat_zone === undefined)
  )
    militaryComplete = false;
  if (
    user.military_status !== 'Civilian' &&
    user.combat_zone === true &&
    !user.combat_deployment_operations
  )
    militaryComplete = false;
  if (user.military_status === 'Veteran' && !user.military_ets)
    militaryComplete = false;
  if (user.anonymous_profile === undefined) privacyComplete = false;
  return {personalComplete, militaryComplete, privacyComplete};
}

export {getMissingInfoSections}
