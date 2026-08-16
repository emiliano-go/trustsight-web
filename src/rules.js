/* Rule id → page anchor, generated from the docs' own rules index
   (docs/reference/rules/index.md). Each rule is documented on its category
   page under an anchor of the same name. R071 uses the primary definition
   (the catalog also lists a corpus variant); R074 and R075 live on their own
   pages under -rule anchors; P001–P007 are documented together on the system
   page under #declared-practice. */
export const RULE_PAGES = {
  c001: 'integrity/#c001',
  c002: 'integrity/#c002',
  c003: 'integrity/#c003',
  c004: 'integrity/#c004',
  c005: 'integrity/#c005',
  c006: 'maintainer-and-metadata/#c006',
  c007: 'fetch-and-execution/#c007',
  d001: 'naming-and-dependency/#d001',
  d002: 'naming-and-dependency/#d002',
  d003: 'naming-and-dependency/#d003',
  d004: 'naming-and-dependency/#d004',
  p001: 'system/#declared-practice',
  p002: 'system/#declared-practice',
  p003: 'system/#declared-practice',
  p005: 'system/#declared-practice',
  p006: 'system/#declared-practice',
  p007: 'system/#declared-practice',
  r001: 'fetch-and-execution/#r001',
  r002: 'fetch-and-execution/#r002',
  r003: 'obfuscation/#r003',
  r004: 'integrity/#r004',
  r005: 'integrity/#r005',
  r006: 'fetch-and-execution/#r006',
  r007: 'install-and-persist/#r007',
  r008: 'fetch-and-execution/#r008',
  r009: 'fetch-and-execution/#r009',
  r010: 'fetch-and-execution/#r010',
  r011: 'fetch-and-execution/#r011',
  r012: 'deception/#r012',
  r013: 'deception/#r013',
  r014: 'integrity/#r014',
  r016: 'naming-and-dependency/#r016',
  r017: 'install-and-persist/#r017',
  r018: 'staging-and-recon/#r018',
  r019: 'integrity/#r019',
  r020: 'fetch-and-execution/#r020',
  r021: 'staging-and-recon/#r021',
  r022: 'fetch-and-execution/#r022',
  r023: 'deception/#r023',
  r024: 'deception/#r024',
  r025: 'obfuscation/#r025',
  r039: 'obfuscation/#r039',
  r040: 'obfuscation/#r040',
  r041: 'fetch-and-execution/#r041',
  r042: 'fetch-and-execution/#r042',
  r043: 'obfuscation/#r043',
  r044: 'fetch-and-execution/#r044',
  r045: 'obfuscation/#r045',
  r046: 'fetch-and-execution/#r046',
  r047: 'fetch-and-execution/#r047',
  r048: 'fetch-and-execution/#r048',
  r049: 'integrity/#r049',
  r050: 'integrity/#r050',
  r051: 'fetch-and-execution/#r051',
  r052: 'install-and-persist/#r052',
  r053: 'install-and-persist/#r053',
  r054: 'install-and-persist/#r054',
  r055: 'fetch-and-execution/#r055',
  r056: 'fetch-and-execution/#r056',
  r057: 'fetch-and-execution/#r057',
  r058: 'staging-and-recon/#r058',
  r059: 'install-and-persist/#r059',
  r060: 'fetch-and-execution/#r060',
  r061: 'fetch-and-execution/#r061',
  r062: 'install-and-persist/#r062',
  r063: 'integrity/#r063',
  r064: 'integrity/#r064',
  r065: 'temporal/#r065',
  r066: 'temporal/#r066',
  r067: 'temporal/#r067',
  r068: 'install-and-persist/#r068',
  r069: 'integrity/#r069',
  r070: 'integrity/#r070',
  r071: 'maintainer-and-metadata/#r071',
  r072: 'composition/#r072',
  r073: 'corpus-behavioral/#r073',
  r074: 'naming-and-dependency/#r074-rule',
  r075: 'count-based/#r075-rule',
  r076: 'fetch-and-execution/#r076',
  r077: 'install-and-persist/#r077',
  r079: 'integrity/#r079',
  r080: 'fetch-and-execution/#r080',
  r081: 'install-and-persist/#r081',
  r082: 'count-based/#r082',
  r083: 'maintainer-and-metadata/#r083',
  r084: 'staging-and-recon/#r084',
  r085: 'install-and-persist/#r085',
  r086: 'staging-and-recon/#r086',
  r087: 'fetch-and-execution/#r087',
  r088: 'staging-and-recon/#r088',
  r089: 'composition/#r089',
  r090: 'maintainer-and-metadata/#r090',
  r092: 'count-based/#r092',
  r093: 'corpus-behavioral/#r093',
  r094: 'integrity/#r094',
  r095: 'naming-and-dependency/#r095',
  r096: 'maintainer-and-metadata/#r096',
  r097: 'maintainer-and-metadata/#r097',
  r098: 'maintainer-and-metadata/#r098',
  r100: 'count-based/#r100',
  r101: 'naming-and-dependency/#r101',
  r102: 'maintainer-and-metadata/#r102',
  r105: 'count-based/#r105',
  r106: 'corpus-behavioral/#r106',
  r107: 'corpus-behavioral/#r107',
  r108: 'maintainer-and-metadata/#r108',
  r110: 'naming-and-dependency/#r110',
  r111: 'corpus-behavioral/#r111',
  r112: 'corpus-behavioral/#r112',
  r114: 'install-and-persist/#r114',
  r115: 'maintainer-and-metadata/#r115',
  r116: 'naming-and-dependency/#r116',
  r117: 'obfuscation/#r117',
  r118: 'integrity/#r118',
  r119: 'deception/#r119',
  r120: 'fetch-and-execution/#r120',
  r121: 'fetch-and-execution/#r121',
  r122: 'integrity/#r122',
  r123: 'fetch-and-execution/#r123',
  r124: 'fetch-and-execution/#r124',
  r125: 'corpus-behavioral/#r125',
  r126: 'maintainer-and-metadata/#r126',
  r127: 'fetch-and-execution/#r127',
  r128: 'staging-and-recon/#r128',
  r129: 'fetch-and-execution/#r129',
  r130: 'integrity/#r130',
  r131: 'integrity/#r131',
  r132: 'obfuscation/#r132',
  r136: 'fetch-and-execution/#r136',
  r137: 'fetch-and-execution/#r137',
  r138: 'fetch-and-execution/#r138',
  r139: 'install-and-persist/#r139',
  r140: 'staging-and-recon/#r140',
  r141: 'maintainer-and-metadata/#r141',
  r142: 'integrity/#r142',
  r143: 'maintainer-and-metadata/#r143',
  s001: 'sabotage/#s001',
  s002: 'sabotage/#s002',
  s003: 'sabotage/#s003',
  s004: 'sabotage/#s004',
  s005: 'sabotage/#s005',
  s006: 'sabotage/#s006',
  s007: 'sabotage/#s007',
  s008: 'sabotage/#s008',
  x001: 'crossfire/#x001',
  x002: 'crossfire/#x002',
  x003: 'crossfire/#x003',
  x004: 'crossfire/#x004',
  x005: 'crossfire/#x005',
  x006: 'crossfire/#x006',
  x007: 'crossfire/#x007',
}

export function ruleHref(id, base) {
  const page = RULE_PAGES[id.toLowerCase()]
  return page ? `${base}${page}` : null
}

/* Expand a range like "R141–R143" into its member ids ("R141", "R142",
   "R143"). Assumes a shared letter prefix and a numeric span of at most 99. */
function rangeIds(a, b) {
  const prefix = a[0]
  const start = Number(a.slice(1))
  const end = Number(b.slice(1))
  if (end < start || end - start > 99) return null
  const out = []
  for (let n = start; n <= end; n += 1) out.push(`${prefix}${String(n).padStart(3, '0')}`)
  return out
}

/* Turn rule mentions inside an HTML string into links to their doc pages.
   Ranges ("S001–S008") become one link to the category page when every rule
   in the range lives on it, or per-rule links when the range crosses pages.
   Single ids link straight to their anchor. Everything else passes through. */
export function linkRules(html, base) {
  return html.replace(/([RCDSXP]\d{3})–([RCDSXP]\d{3})|([RCDSXP]\d{3})/g, (m, ra, rb, single) => {
    if (ra && rb) {
      const ids = rangeIds(ra, rb)
      if (!ids) return m
      const hrefs = ids.map((id) => ruleHref(id, base))
      const known = hrefs.filter(Boolean)
      const first = known[0]
      const allSamePage = first && known.every((href) => href.split('#')[0] === first.split('#')[0])
      if (allSamePage) {
        // Same category page: one link. If every id resolves to the exact
        // same anchor (e.g. the P rules all under #declared-practice, with
        // the skipped P004 falling out of the map) keep the anchor, otherwise
        // link the whole range to the category page.
        const allIdentical = known.every((href) => href === first)
        const target = allIdentical ? first : first.split('#')[0]
        return `<a href="${target}" target="_blank" rel="noreferrer">${m}</a>`
      }
      // The range crosses category pages (R141–R143): one link per rule.
      return ids
        .map((id, i) => {
          const href = hrefs[i]
          return href ? `<a href="${href}" target="_blank" rel="noreferrer">${id}</a>` : id
        })
        .join('–')
    }
    const href = ruleHref(single, base)
    return href ? `<a href="${href}" target="_blank" rel="noreferrer">${single}</a>` : m
  })
}
