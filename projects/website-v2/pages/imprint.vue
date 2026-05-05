<script setup lang="ts">
useHead({ title: 'Imprint — IOTA Registry' })
</script>

<template>
  <div class="legal-page">
    <NuxtLink to="/" class="back-link">← Back</NuxtLink>

    <h1>Imprint</h1>
    <p class="lede">Information according to § 5 DDG</p>

    <section>
      <h2>Provider</h2>
      <p>
        Ralf Süss<br />
        Selkentrop 23<br />
        57392 Schmallenberg<br />
        Germany
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>E-Mail: <a href="mailto:hello@iota-registry.org">hello@iota-registry.org</a></p>
    </section>

    <section>
      <h2>Responsible for editorial content</h2>
      <p>
        Ralf Süss<br />
        Selkentrop 23<br />
        57392 Schmallenberg<br />
        Germany
      </p>
    </section>

    <section>
      <h2>Disclaimer</h2>
      <p>
        No liability is assumed for the use of the website or our validation. All usage is at your own risk.
        Any liability for damages arising from the use of our services is excluded to the fullest extent permitted by law.
      </p>
      <p>
        Our services do not constitute investment advice or financial analysis and are not to be construed as an offer to buy or sell any financial instrument.
      </p>
    </section>

    <section>
      <h2>Liability for contents</h2>
      <p>
        As a service provider, we are responsible for our own content on these pages in accordance with general legislation pursuant to Section 7 (1) TMG.
        According to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
      </p>
      <p>
        Obligations to remove or block the use of information according to general laws remain unaffected. However, liability in this regard is only possible from the
        time of knowledge of a concrete infringement. If we become aware of such infringements, we will remove the content immediately.
      </p>
    </section>

    <section>
      <h2>Liability for links</h2>
      <p>
        Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these
        external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked
        for possible legal violations at the time of linking. Illegal contents were not recognisable at the time of linking.
      </p>
      <p>
        However, a permanent control of the contents of the linked pages is not reasonable without concrete evidence of a violation of the law. If we become aware
        of any infringements, we will remove such links immediately.
      </p>
    </section>

    <section>
      <h2>Copyright</h2>
      <p>
        The content and works created by the site operators on these pages are subject to German copyright law. Reproduction, editing, distribution and any kind of
        exploitation outside the limits of copyright require the written consent of the respective author or creator. Downloads and copies of this site are only
        permitted for private, non-commercial use.
      </p>
      <p>
        Insofar as the content on this page was not created by the operator, the copyrights of third parties are respected. Third-party content is identified as such
        where applicable. Should you nevertheless become aware of a copyright infringement, please notify us accordingly. If we become aware of any infringements,
        we will remove such content immediately.
      </p>
    </section>

    <section>
      <h2>Online Dispute Resolution</h2>
      <p>
        The European Commission provides a platform for online dispute resolution at
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.
        Consumers may use this platform to settle disputes.
      </p>
      <p>
        We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.
      </p>
    </section>
  </div>
</template>

<style scoped>
.legal-page { max-width: 760px; padding-bottom: 60px; }
.back-link {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
  margin-bottom: 24px;
}
.back-link:hover { color: var(--accent, #F5B041); }

.legal-page h1 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 28px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.legal-page .lede {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--text-mute, #94a3b8);
  margin: 0 0 32px;
}

.legal-page section { margin: 0 0 28px; }
.legal-page h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 10px;
}
.legal-page p {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px;
  line-height: 1.7;
  margin: 0 0 10px;
}
.legal-page a { color: var(--accent, #F5B041); text-decoration: none; }
.legal-page a:hover { text-decoration: underline; }
</style>
