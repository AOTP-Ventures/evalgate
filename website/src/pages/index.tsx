import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { CheckCircle, Zap, CheckSquare } from 'lucide-react';

import styles from './index.module.css';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="EvalGate - Stop LLM regressions before they merge"
      description="Get guardrails for your AI features without the support burden. EvalGate runs deterministic evaluations as GitHub PR checks—zero infrastructure, local-only by default.">
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.openSourceBadge}>
            <Zap size={16} />
            Ship AI features with confidence
          </div>
          <h1 className={styles.heroTitle}>
            Stop LLM regressions{' '}
            <span className={styles.heroTitleAccent}>before they merge</span>
          </h1>
          <div className={styles.mitLicenseBadge}>
            <span className={styles.emoji}>🎉</span>
            Open Source & MIT Licensed
          </div>
          <p className={styles.heroDescription}>
            Get guardrails for your AI features without the support burden. EvalGate runs deterministic evaluations 
            as GitHub PR checks—zero infrastructure, local-only by default, setup in under 10 minutes.
          </p>
          <div className={styles.heroButtons}>
            <a 
              href="https://github.com/aotp-ventures/evalgate" 
              className={styles.primaryButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started on GitHub
            </a>
            <Link to="/docs/intro" className={styles.secondaryButton}>
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.featuresTitle}>
            Catch AI regressions before they ship
          </h2>
          <p className={styles.featuresDescription}>
            Run automated evaluations on every PR. Start with deterministic checks, 
            then add LLM-based evaluation when you're ready.
          </p>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCardGreen}>
              <div className={styles.featureIcon}>
                <CheckCircle size={24} />
              </div>
              <h3 className={styles.featureTitle}>Deterministic Checks</h3>
              <p className={styles.featureText}>
                JSON validation, exact matches, latency & cost budgets. Fast, reliable, zero-cost evaluation.
              </p>
            </div>
            
            <div className={styles.featureCardPurple}>
              <div className={styles.featureIconPurple}>
                <span className={styles.brainEmoji}>🧠</span>
              </div>
              <h3 className={styles.featureTitle}>LLM-as-Judge</h3>
              <p className={styles.featureText}>
                Evaluate quality, tone, accuracy, and domain-specific criteria using GPT-4, Claude, or local models.
              </p>
            </div>
          </div>
          
          <div className={styles.statsCard}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>&lt;10 min</div>
                <div className={styles.statLabel}>Setup time</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>Zero</div>
                <div className={styles.statLabel}>Infrastructure</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>Open source</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>
            Ready to stop LLM regressions?
          </h2>
          <p className={styles.ctaDescription}>
            Get started in less than 10 minutes. Zero infrastructure required.
          </p>
          <div className={styles.ctaButtons}>
            <a 
              href="https://github.com/aotp-ventures/evalgate" 
              className={styles.ctaPrimaryButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started on GitHub
            </a>
            <Link to="/docs/intro" className={styles.ctaSecondaryButton}>
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
