import React, {Component} from 'react';
import * as LEGAL from '../../../../shared/constants/LegalCopy';
import styles from './LegalWaiver.module.css';

const Header = () => {
  return (
    <div>
      <div className={styles.legalHeader}>{LEGAL.HEADER}</div>
      <div className={styles.legalSubheader}>{LEGAL.SUBHEADER}</div>
      <div className={styles.legalBodySection}>{LEGAL.INTRODUCTION}</div>
    </div>
  );
};

const Inclusivity = () => {
  return <div className={styles.legalBodyCopy}>{LEGAL.INCLUSIVITY}</div>;
};

const Medical = () => {
  return (
    <div className={styles.legalBodyCopy}>
      <div className={styles.legalBodySection}>Medical:</div>
      {LEGAL.MEDICAL}
    </div>
  );
};

const IndemnficationAndRisk = () => {
  return (
    <div>
      <div className={styles.legalBodyCopy}>
        <div className={styles.legalBodySection}>
          Indemnification and Risk Acknowledgment:
        </div>
        {LEGAL.INDEMNIFICATION}
      </div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_1}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_2}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_3}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_4}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_5}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_6}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_7}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_8}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_9}</div>
      <div className={styles.legalBodyCopy}>{LEGAL.INDEMN_CLAUSE_10}</div>
    </div>
  );
};

const Responsability = () => {
  return <div className={styles.legalBodyCopy}>{LEGAL.RESPONSABILITY}</div>;
};

const Entirety = () => {
  return (
    <div className={styles.legalBodyCopy}>
      <div className={styles.legalBodySection}>Entire Agreement:</div>
      {LEGAL.ENTIRETY}
    </div>
  );
};

const NoWaiver = () => {
  return (
    <div className={styles.legalBodyCopy}>
      <div className={styles.legalBodySection}>No Waiver:</div>
      {LEGAL.NO_WAIVER}
    </div>
  );
};

const Severability = () => {
  return (
    <div className={styles.legalBodyCopy}>
      <div className={styles.legalBodySection}>Severability:</div>
      {LEGAL.SEVERABILITY}
    </div>
  );
};

const Signatures = () => {
  return (
    <div>
      <div className={styles.legalBodyCopy}>
        Participant’s Signature: ELECTRONICALLY SIGNED & DATED
      </div>
      <div className={styles.legalBodyCopy}>
        FOR PARTICIPANTS OF MINORITY AGE (UNDER AGE 18 AT TIME OF REGISTRATION)
      </div>
      <div className={styles.legalBodyCopy}>{LEGAL.MINORITY_CONSENT}</div>
      <div className={styles.legalBodyCopy}>
        Parent/Guardian Signature: ELECTRONICALLY SIGNED & DATED
      </div>
    </div>
  );
};
export default class LegalWaiver extends Component {
  render() {
    return (
      <div>
        <Header />
        <Inclusivity />
        <Medical />
        <IndemnficationAndRisk />
        <Responsability />
        <Entirety />
        <NoWaiver />
        <Severability />
        <Signatures />
      </div>
    );
  }
}
