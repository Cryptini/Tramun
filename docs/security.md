# Security Guide

> Tramuntana handles real user funds. Security is non-negotiable.
>
> **Reference tools:**
> - EVMbench (ChatGPT × Paradigm collaboration)
> - Claude Code Security
> - Slither, Aderyn, Foundry

---

## Threat Model

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Private key exposure | Low (Privy MPC) | Critical | Privy handles key management; never log addresses |
| Smart contract exploit | Medium | Critical | Audit all contracts; use timelocks |
| Front-end supply chain | Medium | High | Lock dependency versions; use `npm audit` |
| Phishing | High | High | Clear domain, no redirects to unknown domains |
| Price manipulation | Low | Medium | Use Chainlink/Morpho oracles; slippage limits |
| Flash loan attack | Low | High | BoringVault timelocks prevent same-block attacks |
| Rug pull risk (underlying) | Low | Medium | Only use audited, established protocols |

---

## Smart Contract Security

### Before Deployment
- [ ] Run Slither static analysis: `slither .`
- [ ] Run Aderyn: `aderyn .`
- [ ] Run Foundry fuzz tests: `forge test --fuzz-runs 10000`
- [ ] Review EVMbench vulnerability patterns
- [ ] External audit (Trail of Bits / Spearbit / Code4rena)
- [ ] Verify all OpenZeppelin library versions are current

### During Audit Checklist
- [ ] Reentrancy guards on all state-changing functions
- [ ] Access control (onlyOwner, onlyManager roles)
- [ ] Integer overflow checks (Solidity 0.8+ has built-in)
- [ ] Timelock on admin functions (minimum 24h, use 72h for funds)
- [ ] Emergency pause mechanism
- [ ] Fee bounds hardcoded (max 50 bps swap fee)
- [ ] No delegate calls to unverified contracts
- [ ] Events emitted for all state changes
- [ ] Oracle staleness check (use Chainlink heartbeat)

### BoringVault-Specific
- [ ] Verify `createOnLogin` creates wallets with correct chain
- [ ] Withdrawal timelock cannot be bypassed
- [ ] Strategy rebalancing requires timelock
- [ ] Fee recipient is a multisig, not EOA
- [ ] Share price manipulation not possible (check Accountant math)

---

## Frontend Security

### Dependency Management
```bash
# Lock all dependency versions (use exact versions in package.json)
# Audit regularly:
npm audit

# Snyk for deeper scanning:
npx snyk test

# Check for outdated packages:
npm outdated
```

### Content Security Policy

Add to `next.config.mjs`:
```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://auth.privy.io",
      "connect-src 'self' https://api.hyperliquid.xyz https://app.peer.xyz",
      "img-src 'self' data: https:",
    ].join('; ')
  }
];
```

### Environment Variables
- NEVER put private keys in frontend code
- NEXT_PUBLIC_ prefix ONLY for values that are safe to expose
- Server-side secrets use process.env without NEXT_PUBLIC_ prefix
- Rotate all keys if they're accidentally committed

---

## Key Management

### User Keys (Privy)
- Privy uses MPC (multi-party computation)
- Neither Privy nor Tramuntana has full key access
- Users can optionally export keys

### Protocol Keys (Tramuntana Admin)
- Vault manager role: use Gnosis Safe multisig (3/5 recommended)
- Fee recipient: use Gnosis Safe multisig
- Strategy updater: use timelock + multisig
- Emergency pause: can be 1/3 multisig for speed

### Builder Address (Hyperliquid fees)
- Use a Gnosis Safe for fee accumulation
- Separate from vault manager keys

---

## Incident Response

If a vulnerability is discovered:

1. **Immediate**: Activate emergency pause on all vaults
2. **Assess**: Quantify potential impact and affected users
3. **Communicate**: Notify affected users within 4h
4. **Fix**: Deploy patch with new timelock
5. **Post-mortem**: Public report within 48h

### Emergency Contacts
- Veda team: [via Discord/Telegram]
- Morpho security: security@morpho.org
- Hyperliquid: via Discord

---

## Privacy

- Don't log wallet addresses in analytics
- Don't store wallet addresses in non-encrypted databases
- Minimize on-chain data (use events for history)
- GDPR: Allow users to request data deletion (off-chain data only — on-chain is permanent)

---

## Audit Resources

| Tool | Type | How to use |
|---|---|---|
| Slither | Static analysis | `pip install slither-analyzer && slither .` |
| Aderyn | Rust-based SA | `cargo install aderyn && aderyn .` |
| Foundry | Testing/fuzzing | `forge test --fuzz-runs 50000` |
| EVMbench | AI-assisted | Use via ChatGPT/Paradigm tooling |
| Claude Code Security | AI code review | Ask Claude to review smart contracts |
| MythX | Deep analysis | Pro tool, use for production |
| Certora | Formal verification | For critical vault logic |

---

## Bug Bounty

Consider setting up a bug bounty program (Immunefi) before mainnet launch:
- Critical vulnerabilities: $50,000 - $500,000 range
- High severity: $10,000 - $50,000
- Medium/Low: $1,000 - $10,000

This incentivizes responsible disclosure and builds user trust.
