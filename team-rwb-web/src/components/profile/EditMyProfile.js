import React, {useState, useMemo, useEffect} from 'react';
import styles from './EditMyProfile.module.css';
import XIcon from '../svgs/XIcon';
import {Paper, Toolbar, IconButton, makeStyles} from '@material-ui/core';
import {useHistory} from 'react-router-dom';
import CheckIcon from '../svgs/CheckIcon';
import LocationIcon from '../svgs/LocationIcon';
import FlagIcon from '../svgs/FlagIcon';
import RWBUserImages from '../RWBUserImages';
import TextInput from '../TextInput';
import TextArea from '../TextArea';
import {userProfile} from '../../../../shared/models/UserProfile';
import ExpansionPanel from './ExpansionPanel';
import RadioButtons from './RadioButtons';
import {isNullOrEmpty} from '../../../../shared/utils/Helpers';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import moment from 'moment';
import {MILITARY_STATUSES} from '../../../../shared/constants/MilitaryStatusSlugs';
import imageHandler from '../ImageHandler';
import {
  EXECUTION_STATUS,
  logProfileCoverPhoto,
  logProfilePhoto,
  logUpdateMilitaryService,
  logUpdateProfile,
} from '../../../../shared/models/Analytics';
import MenuButton from './MenuButton';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    boxShadow: '0px 0px 0px 0px',
    position: 'sticky',
  },
  menuButton: {
    color: 'var(--white)',
  },
  title: {
    color: 'var(--white)',
    textTransform: 'capitalize',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--magenta)',
    height: 64,
  },
  button: {
    color: 'white',
    textTransform: 'capitalize',
  },
  iconLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontWeight: 'bold',
    color: 'var(--grey)',
  },
  iconLabelWrapperSelected: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontWeight: 'bold',
    color: 'var(--magenta)',
  },
  indicator: {
    backgroundColor: 'var(--magenta)',
    border: null,
    borderColor: null,
  },
}));

const EditMyProfile = () => {
  const user = useMemo(() => userProfile.getUserProfile(), []);
  // if the user does not have an ets date, passing undefined creates a moment of now, which we want to avoid
  const etsDate = moment(user.military_ets || 'invalid');
  const ets_date_valid = etsDate.isValid();
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(user.profile_photo_url);
  const [profileImageUri, setProfileImageUri] = useState();
  const [coverImage, setCoverImage] = useState(user.cover_photo_url);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [firstName, setFirstName] = useState(user.first_name);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastName, setLastName] = useState(user.last_name);
  const [lastNameError, setLastNameError] = useState(false);
  const [bioValue, setBioValue] = useState(user.profile_bio);
  const [bioError, setBioError] = useState(false);
  const [militaryStatus, setMilitaryStatus] = useState(user.military_status);
  const [militaryFamily, setMilitaryFamily] = useState(
    user.military_family_member,
  );
  const [militaryBranch, setMilitaryBranch] = useState(user.military_branch);
  const [militaryETSMonth, setMilitaryETSMonth] = useState(
    ets_date_valid ? etsDate.format('MMMM') : '',
  );
  const [militaryETSDay, setMilitaryETSDay] = useState(
    ets_date_valid ? etsDate.format('DD') : '',
  );
  const [militaryETSYear, setMilitaryETSYear] = useState(
    ets_date_valid ? etsDate.format('YYYY') : '',
  );
  const [militaryETSError, setMilitaryETSError] = useState(false);
  const [militaryRank, setMilitaryRank] = useState(user.military_rank);
  const [rankError, setRankError] = useState(false);
  const [disability, setDisability] = useState(user.has_disability);
  const [combatZone, setCombatZone] = useState(user.combat_zone);
  const [combatZoneOperation, setCombatZoneOperation] = useState(
    user.combat_deployment_operations,
  );
  const [chapterData, setChapterData] = useState([]);
  const [preferredChapter, setPreferredChapter] = useState(
    user.preferred_chapter,
  );
  const [newsletterSubscription1, setNewsletterSubscription1] = useState(
    user.newsletter_subscription?.[0],
  );
  const [newsletterSubscription2, setNewsletterSubscription2] = useState(
    user.newsletter_subscription?.[1],
  );
  const [expandedMilitaryPanel, setExpandedMilitaryPanel] = useState(false);

  const MAX_BIO_CHARS = 250;

  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    rwbApi
      .getChapters()
      .then((jsonBody) => {
        let {data} = jsonBody;
        setChapterData(data);
        setIsLoading(false);
      })
      .catch(() => {
        alert(
          'Team RWB: There was an error finding a list of available chapters.',
        );
      });
  }, []);

  const addImageHandler = async (e, type) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      // needs support for iOS devices as they are 'image/' type,
      // but are not selectable from the html accept value
      if (!file.type.includes('image/')) {
        window.alert('Invalid file format: please upload an image.');
        return;
      } else if (type === 'cover') {
        setCoverImageFile(file);
        reader.readAsDataURL(file);
        reader.onload = () => {
          setCoverImage(reader.result);
        };
      } else {
        logProfilePhoto();
        setProfileImageUri(file);
        reader.readAsDataURL(file);
        reader.onload = () => {
          setProfileImage(reader.result);
        };
      }
    }
  };

  const uploadCoverImageHandler = async () => {
    try {
      return await imageHandler(coverImageFile, 'cover');
    } catch (error) {
      alert('Team RWB', error.message);
    }
  };

  const uploadProfileImage = async () => {
    // prevent invalid and unneeded server call when there is no profile photo
    if (!profileImageUri) return;
    const profilePhotoPayload = formDataMaker(profileImageUri);
    await rwbApi
      .putUserPhotoWeb(profilePhotoPayload)
      .then((jsonBody) => {
        if (jsonBody.hasOwnProperty('url')) {
          // server returns 200 when upload fails, so double check that it has a url
          setProfileImage(jsonBody.url);
        } else throw new Error();
      })
      .catch((error) => {
        alert(
          "There was an issue uploading your image to Team RWB's server. Please try again",
        );
      });
  };

  const clearWarnings = () => {
    setExpandedMilitaryPanel(false);
    setFirstNameError(false);
    setLastNameError(false);
    setBioError(false);
    setMilitaryETSError(false);
    setRankError(false);
  };

  const handleChapterLog = () => {
    let changed = false;
    if (
      preferredChapter?.id?.toString() !== user.preferred_chapter?.id?.toString()
    )
      changed = true;
    if (
      newsletterSubscription1?.id?.toString() !==
      user.newsletter_subscription[0]?.id.toString()
    )
      changed = true;
    if (
      newsletterSubscription2?.id?.toString() !==
      user.newsletter_subscription[1]?.id.toString()
    )
      changed = true;
  };

  const handleMilitaryLog = () => {
    let changed = false;
    if (militaryStatus !== user.military_status) changed = true;
    if (militaryBranch !== user.military_branch) changed = true;
    if (disability !== user.has_disability) changed = true;
    if (combatZone !== user.combat_zone) changed = true;
    if (combatZoneOperation !== user.combat_deployment_operations)
      changed = true;
    if (militaryRank !== user.military_rank) changed = true;
    if (etsDate.format('YYYY-MM-DD') !== user.military_ets) changed = true;
    if (militaryFamily !== user.military_family_member) changed = true;
    if (changed) logUpdateMilitaryService();
  };

  const updateProfile = async () => {
    setIsLoading(true);
    clearWarnings();
    let hasError = false;
    if (isNullOrEmpty(firstName)) {
      setFirstNameError(true);
      hasError = true;
    }
    if (isNullOrEmpty(lastName)) {
      setLastNameError(true);
      hasError = true;
    }
    if (bioValue && bioValue.length > MAX_BIO_CHARS) {
      setBioError(true);
      hasError = true;
    }
    if (
      militaryStatus === MILITARY_STATUSES.veteran &&
      (!militaryETSMonth || !militaryETSDay || !militaryETSYear)
    ) {
      setExpandedMilitaryPanel(true);
      setMilitaryETSError(true);
      hasError = true;
    }
    if (militaryStatus !== MILITARY_STATUSES.civilian && !militaryRank) {
      setExpandedMilitaryPanel(true);
      setRankError(true);
      hasError = true;
    }
    // check all fields for errors, then return.
    if (hasError) {
      setIsLoading(false);
      return;
    }
    const etsdDate = moment(
      `${militaryETSMonth} ${militaryETSDay} ${militaryETSYear}`,
      'MMMM DD YYYY',
    );
    let payload = {
      first_name: firstName,
      last_name: lastName,
      profile_bio: bioValue,
      cover_photo_url: coverImage,
      military_status: militaryStatus,
    };
    if (coverImageFile) {
      const result = await uploadCoverImageHandler();
      if (result) {
        payload.cover_photo_url = result;
        logProfileCoverPhoto({has_image: coverImageFile !== null, execution_status: EXECUTION_STATUS.success});
      } else {
        logProfileCoverPhoto({has_image: coverImageFile !== null, execution_status: EXECUTION_STATUS.failure});
      }
    }
    // to avoid SF sync issues, only add these fields when they can be accessed
    if (militaryStatus === MILITARY_STATUSES.veteran)
      payload.military_ets = etsdDate.toISOString().slice(0, 10);
    if (militaryStatus !== MILITARY_STATUSES.civilian) {
      payload.military_branch = militaryBranch;
      payload.military_rank = militaryRank;
      payload.has_disability = disability;
      payload.combat_zone = combatZone;
    } else {
      payload.military_family_member = militaryFamily;
    }
    // extra chance to avoid salesforce syncing issues
    if (combatZone) payload.combat_deployment_operations = combatZoneOperation;
    await rwbApi.putUser(JSON.stringify(payload));
    await uploadProfileImage();
    logUpdateProfile();
    handleChapterLog();
    handleMilitaryLog();
    const chaptersPayload = {
      preferred_chapter: preferredChapter.id?.toString(),
      newsletter_subscription: [
        {
          id: newsletterSubscription1?.id?.toString(),
        },
        {
          id: newsletterSubscription2?.id?.toString(),
        },
      ],
    };
    await rwbApi.putChapters(JSON.stringify(chaptersPayload));
    setIsLoading(false);
    history.goBack();
  };

  const formDataMaker = (file) => {
    let formData = new FormData();
    formData.append('photo', file);
    return formData;
  };

  return (
    <Paper className={classes.root}>
      {isLoading && (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      )}
      <Toolbar className={classes.toolbar}>
        <IconButton
          onClick={() => history.goBack()}
          className={classes.menuButton}
          color="inherit">
          <XIcon tintColor={'var(--white)'} />
        </IconButton>
        <p className="title">Edit Profile</p>
        <IconButton
          onClick={updateProfile}
          className={classes.menuButton}
          color="inherit">
          <CheckIcon tintColor={'var(--white)'} />
        </IconButton>
      </Toolbar>
      <div className={styles.userImageContainer}>
        <RWBUserImages
          profilePhoto={profileImage}
          coverPhoto={coverImage}
          edit={true}
          onChangeProfile={(e) => addImageHandler(e, 'profile')}
          onChangeCover={(e) => addImageHandler(e, 'cover')}
        />
        <div className={styles.contentContainer}>
          <TextInput
            label={'First Name'}
            error={firstNameError ? 'This field is required.' : ''}
            value={firstName}
            onValueChange={(e) => setFirstName(e.target.value)}
          />
          <RadioButtons />
          <TextInput
            label={'Last Name'}
            error={lastNameError ? 'This field is required.' : ''}
            value={lastName}
            onValueChange={(e) => setLastName(e.target.value)}
          />
          <div className={styles.preferredChapterContainer}>
            {/* <MenuButton
              label="Local Chapter"
              data={chapterData}
              userProp={user.preferred_chapter.name}
              setMilitaryValue={setPreferredChapter}
            /> */}
            <p className={styles.label}>Local Chapter</p>
            <p>{user.preferred_chapter.name}</p>
          </div>
          <TextArea
            label={'Profile Bio'}
            placeholder={'Enter Profile Bio'}
            error={bioError ? 'EXCEEDED THE PROFILE BIO LIMIT' : ''}
            maxChar={MAX_BIO_CHARS}
            value={bioValue || ''}
            onChange={(value) => setBioValue(value)}
          />
        </div>
        <div onClick={() => setExpandedMilitaryPanel(!expandedMilitaryPanel)}>
          <ExpansionPanel
            expanded={expandedMilitaryPanel}
            label="Military Service"
            Icon={FlagIcon}
            user={user}
            militaryStatus={militaryStatus}
            militaryFamily={militaryFamily}
            militaryBranch={militaryBranch}
            militaryRank={militaryRank}
            disability={disability}
            combatZone={combatZone}
            combatZoneOperation={combatZoneOperation}
            militaryETSMonth={militaryETSMonth}
            militaryETSDay={militaryETSDay}
            militaryETSYear={militaryETSYear}
            militaryETSError={militaryETSError}
            rankError={rankError}
            setMilitaryStatus={setMilitaryStatus}
            setMilitaryFamily={setMilitaryFamily}
            setMilitaryBranch={setMilitaryBranch}
            setMilitaryRank={setMilitaryRank}
            setDisability={setDisability}
            setMilitaryETSMonth={setMilitaryETSMonth}
            setMilitaryETSDay={setMilitaryETSDay}
            setMilitaryETSYear={setMilitaryETSYear}
            setCombatZone={setCombatZone}
            setCombatZoneOperation={setCombatZoneOperation}
          />
        </div>
      </div>
    </Paper>
  );
};

export default EditMyProfile;
