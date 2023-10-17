import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import * as PRIVACY from '../../shared/constants/PrivacyPolicy';

import globalStyles, {RWBColors} from '../styles';

const Header = () => {
  return (
    <View>
      <Text style={[globalStyles.legalHeader, styles.bold]}>
        {PRIVACY.HEADER}
      </Text>
      <Text style={[globalStyles.legalSubheader, styles.bold]}>
        {PRIVACY.SUBHEADER}
      </Text>
      <Text style={styles.text}>
        This policy describes the types of information we may collect from you
        or that you may provide when you visit the website{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('https://www.teamrwb.org/')}>
          teamrwb.org
        </Text>{' '}
        (our <Text style={styles.bold}>“Website”</Text>) and our practices for
        collecting, using, maintaining, protecting and disclosing that
        information.
      </Text>
      <NewLine />
      <Text style={styles.text}>
        The Website is hosted on WP Engine and you can access more information
        about their security environment{' '}
        <Text
          style={styles.link}
          onPress={() =>
            Linking.openURL(
              'https://wpengine.com/support/wp-engines-security-environment/',
            )
          }>
          here
        </Text>
        . The information on the Website is transferred via a secure connection
        utilizing{' '}
        <Text
          style={styles.link}
          onPress={() =>
            Linking.openURL('https://letsencrypt.org/repository/')
          }>
          Let’s Encrypt Authority X3 SSL
        </Text>
        . All personal data that is collected via website forms is securely
        transmitted and currently stored in a third-party CRM solution
        (Salesforce.org). Salesforce.org uses the Salesforce.com standard trust
        statement. The{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('https://trust.salesforce.com/en/')}>
          trust.salesforce.com
        </Text>{' '}
        site provides real-time information on system security and performance.
        Click here for complete details on Salesforce’s full{' '}
        <Text
          style={styles.link}
          onPress={() =>
            Linking.openURL(
              'https://www.salesforce.com/company/privacy/full_privacy/',
            )
          }>
          privacy policy
        </Text>
        .
      </Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.INTRODUCTION_LINKLESS}</Text>
    </View>
  );
};

// used to separate titles
const NewLine = () => {
  return <Text>{``}</Text>;
};

const InformationCollection = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>
        Information We Collect About You and How We Collect It
      </Text>
      <NewLine />
      <View>
        <Text style={styles.text}>
          {PRIVACY.INFORMATION_CLAUSE_1_1}
          <Text style={styles.bold}>“Personal Information”</Text>
          <Text>).</Text>
        </Text>
      </View>
      <Text style={styles.text}>{PRIVACY.INFORMATION_CLAUSE_1_2}</Text>
      <Text style={[styles.text, styles.bold]}>
        Information You Provide to Us
      </Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.INFORMATION_CLAUSE_2}</Text>
      <View>
        <Text style={[styles.text, styles.bold]}>
          Information We Collect Through Automatic Data Collection Technologies
        </Text>
        <NewLine />
        <Text style={styles.text}>{PRIVACY.INFORMATION_CLAUSE_3}</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Cookies (or browser cookies). </Text>
          {PRIVACY.BROWSER_COOKIES}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Flash Cookies. </Text>
          {PRIVACY.FLASH_COOKIES}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Web Beacons. </Text>
          {PRIVACY.WEB_BEACONS}
        </Text>
      </View>
    </View>
  );
};

const InformationUsage = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>
        How We Use Your Information
      </Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.INFORMATION_USAGE}</Text>
    </View>
  );
};

const InformationDisclosure = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>
        Disclosure of Your Information
      </Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.INFORMATION_DISCLOSURE}</Text>
    </View>
  );
};

const TransferInformation = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>
        Transfer of Personal Information and your Right of Access
      </Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.TRANSFER_INFORMATION}</Text>
    </View>
  );
};

const DataSecurity = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>Data Security</Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.DATA_SECURITY}</Text>
    </View>
  );
};

const Children = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>
        Children Under the Age of 13
      </Text>
      <NewLine />
      <Text style={styles.text}>
        {PRIVACY.CHILDREN}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('mailto:info@teamrwb.org')}>
          info@teamrwb.org
        </Text>
        .
      </Text>
    </View>
  );
};

const California = () => {
  return (
    <View>
      <NewLine />
      <Text style={[styles.text, styles.bold]}>
        Your California Privacy Rights
      </Text>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.CALIFORNIA_PRIVACY}</Text>
    </View>
  );
};

const Contact = () => {
  return (
    <View>
      <Text style={[styles.text, styles.bold]}>Contact Information</Text>
      <NewLine />
      <Text style={styles.text}>
        {PRIVACY.CONTACT_INFORMATION}{' '}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('mailto:info@teamrwb.org')}>
          info@teamrwb.org
        </Text>
        .
      </Text>
    </View>
  );
};

const Updated = () => {
  return (
    <View>
      <NewLine />
      <Text style={styles.text}>{PRIVACY.LAST_UPDATE}</Text>
    </View>
  );
};

export default class PrivacyPolicyCopy extends Component {
  render() {
    return (
      <View>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  link: {
    color: RWBColors.magenta,
  },
  bold: {
    fontWeight: 'bold',
  },
  text: {
    color: RWBColors.navy,
  },
});
