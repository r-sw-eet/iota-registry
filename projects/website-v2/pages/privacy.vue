<script setup lang="ts">
useHead({ title: 'Privacy Policy — IOTA Registry' })
</script>

<template>
  <div class="legal-page">
    <NuxtLink to="/" class="back-link">← Back</NuxtLink>

    <h1>Privacy Policy</h1>
    <p class="lede">Data Protection Declaration (GDPR)</p>

    <section>
      <p>
        Unless stated otherwise below, providing your personal data is neither legally nor contractually obligatory, nor required for conclusion of a contract.
        You are not obliged to provide your data, not providing it will have no consequences. This only applies as long as the processing procedures below do not
        state otherwise.
      </p>
      <p>"Personal data" is any information relating to an identified or identifiable natural person.</p>
    </section>

    <section>
      <h2>Server Log Files &amp; Retention</h2>
      <p>
        Each time you access our website, a server log file is created. This may include your IP address, request timestamps, requested URL, user-agent string and
        referrer URL. We retain server logs for a minimum of 7 and a maximum of 14 days, after which they are automatically deleted.
      </p>
    </section>

    <section>
      <h2>Data Subject Rights</h2>
      <p>Under Articles 15-21 of the EU General Data Protection Regulation (GDPR), you have the right to:</p>
      <ul>
        <li>Request confirmation as to whether and what personal data we process about you (Art. 15 GDPR)</li>
        <li>Obtain correction of inaccurate data or completion of incomplete data (Art. 16 GDPR)</li>
        <li>Request deletion ("right to be forgotten") (Art. 17 GDPR)</li>
        <li>Request restriction of processing (Art. 18 GDPR)</li>
        <li>Receive your personal data in a structured, commonly used and machine-readable format, and transmit it to another controller ("data portability") (Art. 20 GDPR)</li>
        <li>Object to processing based on our legitimate interests (Art. 21 (1) GDPR)</li>
      </ul>
      <p>To exercise any of these rights, please contact us at <a href="mailto:hello@iota-registry.org">hello@iota-registry.org</a>.</p>
    </section>

    <section>
      <h2>Cookies &amp; Browser Storage</h2>
      <p>
        We do not use cookies. Any site preferences (e.g. theme toggles) are stored locally in your browser's localStorage and are deleted automatically when you
        clear your browser data. For the analytics script we load, see the "Web Analytics" section below.
      </p>
    </section>

    <section>
      <h2>Web Analytics</h2>
      <p>
        We use Plausible Analytics, a privacy-friendly, cookieless analytics service provided by Plausible Insights OÜ, Västriku tn 2, 50403 Tartu, Estonia.
        Plausible loads a small script from <code>plausible.io</code> and records aggregated page view data (page URL, referrer, browser, operating system, device
        type and a coarse country derived from the IP address).
      </p>
      <p>
        Plausible does not use cookies, does not store or share personal data, does not retain IP addresses, and does not track visitors across sites or over time.
        All data is aggregated and cannot be traced back to an individual. Data is processed on EU-hosted infrastructure.
      </p>
      <p>
        The legal basis for this processing is our legitimate interest in understanding overall site usage to improve the service (Art. 6 (1) (f) GDPR). You can
        read more about Plausible's data practices at
        <a href="https://plausible.io/data-policy" target="_blank" rel="noopener">plausible.io/data-policy</a>.
      </p>
    </section>

    <section>
      <h2>External Data Sources</h2>
      <p>
        The website fetches on-chain data from public APIs to display network metrics and ecosystem information. These requests are made server-side by the backend —
        no personal data of website visitors is transmitted to these services:
      </p>
      <ul>
        <li>IOTA Mainnet RPC (api.mainnet.iota.cafe)</li>
        <li>IOTA Mainnet GraphQL (graphql.mainnet.iota.cafe)</li>
        <li>DefiLlama API (api.llama.fi)</li>
      </ul>
    </section>

    <section>
      <h2>Web Hosting</h2>
      <p>
        This site is hosted by Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany. We have concluded a Data Processing Agreement with Hetzner under
        Art. 28 GDPR to ensure your data is processed in accordance with the GDPR.
      </p>
    </section>

    <section>
      <h2>Data Protection Officer</h2>
      <p>No Data Protection Officer has been appointed, as one is not required by law for the processing activities described.</p>
    </section>

    <section>
      <h2>Supervisory Authority</h2>
      <p>
        Under the GDPR, the competent supervisory authority is determined by the location of the party responsible for processing personal data — most often by
        server location.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        Ralf Süss<br />
        Selkentrop 23<br />
        57392 Schmallenberg<br />
        Germany<br />
        Email: <a href="mailto:hello@iota-registry.org">hello@iota-registry.org</a>
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
.legal-page ul {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px;
  line-height: 1.7;
  list-style: disc;
  padding-left: 20px;
  margin: 0 0 10px;
}
.legal-page code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  background: var(--chip-bg, #0e1626);
  padding: 1px 6px;
  border-radius: 4px;
}
.legal-page a { color: var(--accent, #F5B041); text-decoration: none; }
.legal-page a:hover { text-decoration: underline; }
</style>
