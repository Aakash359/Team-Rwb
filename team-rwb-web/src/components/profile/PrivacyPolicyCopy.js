import React, {Component} from 'react';
import * as PRIVACY from '../../../../shared/constants/PrivacyPolicy';
import styles from './PrivacyPolicyCopy.module.css';

const Header = () => {
  return (
    <div>
      <div className={`${styles.legalHeader} ${styles.bold}`}>
        {PRIVACY.HEADER}
      </div>
      <div className={`${styles.legalSubheader} ${styles.bold}`}>
        {PRIVACY.SUBHEADER}
      </div>
      <div className={styles.item}>
        This policy describes the types of information we may collect from you
        or that you may provide when you visit the website{' '}
        <div
          className={styles.link}
          onClick={() => window.open('https://www.teamrwb.org/')}>
          teamrwb.org
        </div>{' '}
        (our <span className={styles.bold}>“Website”</span>) and our practices
        for collecting, using, maintaining, protecting and disclosing that
        information.
      </div>
      <NewLine />
      <div className={styles.item}>
        The Website is hosted on WP Engine and you can access more information
        about their security environment{' '}
        <div
          className={styles.link}
          onClick={() =>
            window.open(
              'https://wpengine.com/support/wp-engines-security-environment/',
            )
          }>
          here
        </div>
        . The information on the Website is transferred via a secure connection
        utilizing{' '}
        <div
          className={styles.link}
          onClick={() => window.open('https://letsencrypt.org/repository/')}>
          Let’s Encrypt Authority X3 SSL
        </div>
        . All personal data that is collected via website forms is securely
        transmitted and currently stored in a third-party CRM solution
        (Salesforce.org). Salesforce.org uses the Salesforce.com standard trust
        statement. The{' '}
        <div
          className={styles.link}
          onClick={() => window.open('https://trust.salesforce.com/en/')}>
          trust.salesforce.com
        </div>{' '}
        site provides real-time information on system security and performance.
        Click here for complete details on Salesforce’s full{' '}
        <div
          className={styles.link}
          onClick={() =>
            window.open(
              'https://www.salesforce.com/company/privacy/full_privacy/',
            )
          }>
          privacy policy
        </div>
        .
      </div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.INTRODUCTION_LINKLESS}</div>
    </div>
  );
};

// used to separate titles
const NewLine = () => {
  return <div>{``}</div>;
};

const InformationCollection = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>
        Information We Collect About You and How We Collect It
      </div>
      <NewLine />
      <div>
        <div className={styles.item}>
          {PRIVACY.INFORMATION_CLAUSE_1_1}
          <div className={styles.bold}>“Personal Information”</div>
          <div>.</div>
        </div>
      </div>
      <div className={styles.item}>{PRIVACY.INFORMATION_CLAUSE_1_2}</div>
      <div className={`${styles.item} ${styles.bold}`}>
        Information You Provide to Us
      </div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.INFORMATION_CLAUSE_2}</div>
      <div>
        <div className={`${styles.item} ${styles.bold}`}>
          Information We Collect Through Automatic Data Collection Technologies
        </div>
        <NewLine />
        <div className={styles.item}>{PRIVACY.INFORMATION_CLAUSE_3}</div>
        <div className={styles.item}>
          <div className={styles.bold}>Cookies (or browser cookies). </div>
          {PRIVACY.BROWSER_COOKIES}
        </div>
        <div className={styles.item}>
          <div className={styles.bold}>Flash Cookies. </div>
          {PRIVACY.FLASH_COOKIES}
        </div>
        <div className={styles.item}>
          <div className={styles.bold}>Web Beacons. </div>
          {PRIVACY.WEB_BEACONS}
        </div>
      </div>
    </div>
  );
};

const InformationUsage = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>
        How We Use Your Information
      </div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.INFORMATION_USAGE}</div>
    </div>
  );
};

const InformationDisclosure = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>
        Disclosure of Your Information
      </div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.INFORMATION_DISCLOSURE}</div>
    </div>
  );
};

const TransferInformation = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>
        Transfer of Personal Information and your Right of Access
      </div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.TRANSFER_INFORMATION}</div>
    </div>
  );
};

const DataSecurity = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>Data Security</div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.DATA_SECURITY}</div>
    </div>
  );
};

const Children = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>
        Children Under the Age of 13
      </div>
      <NewLine />
      <div className={styles.item}>
        {PRIVACY.CHILDREN}
        <div
          className={styles.link}
          onClick={() => window.open('mailto:info@teamrwb.org')}>
          info@teamrwb.org
        </div>
        .
      </div>
    </div>
  );
};

const California = () => {
  return (
    <div>
      <NewLine />
      <div className={`${styles.item} ${styles.bold}`}>
        Your California Privacy Rights
      </div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.CALIFORNIA_PRIVACY}</div>
    </div>
  );
};

const Contact = () => {
  return (
    <div>
      <div className={`${styles.item} ${styles.bold}`}>Contact Information</div>
      <NewLine />
      <div className={styles.item}>
        {PRIVACY.CONTACT_INFORMATION}{' '}
        <div
          className={styles.link}
          onClick={() => window.open('mailto:info@teamrwb.org')}>
          info@teamrwb.org
        </div>
        .
      </div>
    </div>
  );
};

const Updated = () => {
  return (
    <div>
      <NewLine />
      <div className={styles.item}>{PRIVACY.LAST_UPDATE}</div>
    </div>
  );
};

export default class PrivacyPolicyCopy extends Component {
  render() {
    return (
      <div>
        <Header />
        <InformationCollection />
        <InformationUsage />
        <InformationDisclosure />
        <TransferInformation />
        <DataSecurity />
        <Children />
        <California />
        <Contact />
        <Updated />
      </div>
    );
  }
}
