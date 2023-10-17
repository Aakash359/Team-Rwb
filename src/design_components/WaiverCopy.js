import React, {Component} from 'react';
import {View, Text} from 'react-native';
import * as LEGAL from './../../shared/constants/LegalCopy';

import globalStyles, {RWBColors} from '../styles';

const Header = () => {
  return (
    <View>
      <Text style={globalStyles.legalHeader}>{LEGAL.HEADER}</Text>
      <Text style={globalStyles.legalSubheader}>{LEGAL.SUBHEADER}</Text>
      <Text style={globalStyles.legalBodySection}>{LEGAL.INTRODUCTION}</Text>
    </View>
  );
};

const Inclusivity = () => {
  return <Text style={globalStyles.legalBodyCopy}>{LEGAL.INCLUSIVITY}</Text>;
};

const Medical = () => {
  return (
    <Text style={globalStyles.legalBodyCopy}>
      <Text style={globalStyles.legalBodySection}>Medical:</Text>
      {LEGAL.MEDICAL}
    </Text>
  );
};

const IndemnficationAndRisk = () => {
  return (
    <View>
      <Text style={globalStyles.legalBodyCopy}>
        <Text style={globalStyles.legalBodySection}>
          Indemnification and Risk Acknowledgment:
        </Text>
        {LEGAL.INDEMNIFICATION}
      </Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_1}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_2}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_3}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_4}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_5}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_6}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_7}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_8}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_9}</Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_10}</Text>
    </View>
  );
};

const Responsability = () => {
  return <Text style={globalStyles.legalBodyCopy}>{LEGAL.RESPONSABILITY}</Text>;
};

const Entirety = () => {
  return (
    <Text style={globalStyles.legalBodyCopy}>
      <Text style={globalStyles.legalBodySection}>Entire Agreement:</Text>
      {LEGAL.ENTIRETY}
    </Text>
  );
};

const NoWaiver = () => {
  return (
    <Text style={globalStyles.legalBodyCopy}>
      <Text style={globalStyles.legalBodySection}>No Waiver:</Text>
      {LEGAL.NO_WAIVER}
    </Text>
  );
};

const Severability = () => {
  return (
    <Text style={globalStyles.legalBodyCopy}>
      <Text style={globalStyles.legalBodySection}>Severability:</Text>
      {LEGAL.SEVERABILITY}
    </Text>
  );
};

const Signatures = () => {
  return (
    <View>
      <Text style={globalStyles.legalBodyCopy}>
        Participant’s Signature: ELECTRONICALLY SIGNED & DATED
      </Text>
      <Text style={globalStyles.legalBodyCopy}>
        FOR PARTICIPANTS OF MINORITY AGE (UNDER AGE 18 AT TIME OF REGISTRATION)
      </Text>
      <Text style={globalStyles.legalBodyCopy}>{LEGAL.MINORITY_CONSENT}</Text>
      <Text style={globalStyles.legalBodyCopy}>
        Parent/Guardian Signature: ELECTRONICALLY SIGNED & DATED
      </Text>
    </View>
  );
};
export default class WaiverCopy extends Component {
  render() {
    return (
      <View>
        <Header />
        <Inclusivity />
        <Medical />
        <IndemnficationAndRisk />
        <Responsability />
        <Entirety />
        <NoWaiver />
        <Severability />
        <Signatures />
      </View>
    );
  }
}
