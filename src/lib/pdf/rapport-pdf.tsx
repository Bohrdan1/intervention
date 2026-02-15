import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  Svg,
  Path,
} from '@react-pdf/renderer';
import type { RapportComplet, PhotoItem } from '@/lib/types';
import { SOCIETE } from '@/lib/types';
import { LOGO_AAC_BASE64 } from './logo';

// ============================================
// SVG Checkmark (remplace le caractère unicode)
// ============================================
function CheckMark() {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24">
      <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#333" />
    </Svg>
  );
}

function CrossMark() {
  return (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#cc0000" />
    </Svg>
  );
}

function WrenchIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24">
      <Path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="#333" />
    </Svg>
  );
}

// ============================================
// STYLES
// ============================================
const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 65,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  // En-tete
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  // Titre
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 14,
  },
  // Infos installation
  infoBlock: { marginBottom: 10 },
  infoRow: { flexDirection: 'row', marginBottom: 1 },
  // ── TABLEAU ──
  table: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    minHeight: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  rowAlt: {
    flexDirection: 'row',
    minHeight: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    minHeight: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  erpHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    minHeight: 22,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  // Cellules avec bordures verticales
  cellNom: {
    width: '40%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingLeft: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  cellEtat: {
    width: '15%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellObs: {
    width: '45%',
    paddingLeft: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  // Bordure extérieure du tableau
  tableOuter: {
    borderWidth: 1,
    borderColor: '#000',
  },
  // Note
  noteText: {
    fontSize: 7,
    color: '#cc0000',
    fontFamily: 'Helvetica-BoldOblique',
    marginTop: 4,
    marginBottom: 1,
  },
  noteSmall: {
    fontSize: 7,
    marginBottom: 2,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#999',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#444',
  },
  // Constat
  constatTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 30,
    marginBottom: 30,
  },
  constatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
    gap: 8,
  },
  constatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 30,
  },
  constatCheckBox: {
    width: 16,
    marginRight: 8,
    marginTop: 1,
  },
  signatureImage: {
    width: 150,
    height: 80,
    marginTop: 10,
    marginLeft: 140,
  },
  // Photos
  photosSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  photosTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    textDecoration: 'underline',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: '48%',
    marginBottom: 6,
  },
  photoImage: {
    width: '100%',
    height: 160,
    objectFit: 'contain',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  photoLabel: {
    fontSize: 7,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
});

// ============================================
// HELPERS
// ============================================
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function RenderEtat({ etat }: { etat: string }) {
  switch (etat) {
    case 'ok':
      return <CheckMark />;
    case 'correction':
      return <Text style={{ fontSize: 7, color: '#cc0000', textAlign: 'center' }}>Correction</Text>;
    case 'prevention':
      return <Text style={{ fontSize: 7, color: '#e67300', fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>Prevention</Text>;
    default:
      return <Text style={{ fontSize: 9, textAlign: 'center' }}>-</Text>;
  }
}

// ============================================
// Section Photos
// ============================================
function PhotosSection({ photos, title }: { photos: PhotoItem[]; title?: string }) {
  if (!photos || photos.length === 0) return null;
  return (
    <View style={s.photosSection} wrap={false}>
      <Text style={s.photosTitle}>{title || 'Photos'}</Text>
      <View style={s.photosGrid}>
        {photos.map((photo, i) => (
          <View key={i} style={s.photoContainer}>
            <Image style={s.photoImage} src={photo.url} />
            {photo.label ? <Text style={s.photoLabel}>{photo.label}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================
// Footer
// ============================================
function Footer({ pageNum, totalPages }: { pageNum: number; totalPages: number }) {
  return (
    <View style={s.footer} fixed>
      <View style={{ width: '33%' }}>
        <Text>{SOCIETE.nom}</Text>
        <Text>RIDET    {SOCIETE.ridet}</Text>
        <Text>RC/Decennale : {SOCIETE.rc}</Text>
      </View>
      <View style={{ width: '33%', textAlign: 'center' }}>
        <Text>Telephone {SOCIETE.telephone}</Text>
        <Text>Mail {SOCIETE.mail}</Text>
        <Text></Text>
      </View>
      <View style={{ width: '33%', textAlign: 'right' }}>
        <Text>Code APE {SOCIETE.codeApe}</Text>
        <Text style={{ fontSize: 7 }}>Page {pageNum} sur {totalPages}</Text>
      </View>
    </View>
  );
}

// ============================================
// Page de controle d'une porte
// ============================================
function PageControle({
  rapport,
  controle,
  installation,
  pageNum,
  totalPages,
  photos,
}: {
  rapport: RapportComplet;
  controle: RapportComplet['controles'][0];
  installation: RapportComplet['controles'][0]['installation'];
  pageNum: number;
  totalPages: number;
  photos: PhotoItem[];
}) {
  return (
    <Page size="A4" style={s.page}>
      {/* En-tete avec logo */}
      <View style={s.header}>
        <Image style={{ width: 90, height: 50 }} src={LOGO_AAC_BASE64} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9 }}>{rapport.numero_cm}</Text>
          <Text style={{ fontSize: 9 }}>LE {formatDate(rapport.date_intervention)}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{rapport.client.nom}</Text>
          {rapport.client.sous_titre && (
            <Text style={{ fontSize: 8 }}>{rapport.client.sous_titre}</Text>
          )}
        </View>
      </View>

      {/* Titre */}
      <Text style={s.title}>Compte rendu de maintenance preventive et corrective</Text>

      {/* Infos installation */}
      <View style={s.infoBlock}>
        <View style={s.infoRow}>
          <Text style={{ width: 90, fontFamily: 'Helvetica-BoldOblique', fontSize: 9 }}>Site</Text>
          <Text style={{ fontSize: 9 }}>: {rapport.site.nom}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={{ width: 90, fontFamily: 'Helvetica-BoldOblique', fontSize: 9 }}>installation</Text>
          <Text style={{ fontFamily: 'Helvetica-BoldOblique', fontSize: 9 }}>: {installation.repere}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={{ width: 90, fontFamily: 'Helvetica-Oblique', fontSize: 9 }}>Type</Text>
          <Text style={{ fontSize: 9 }}>: {installation.type_porte}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={{ width: 90, fontFamily: 'Helvetica-Oblique', fontSize: 9 }}>Modele</Text>
          <Text style={{ fontSize: 9 }}>; {installation.modele || ''}</Text>
        </View>
      </View>

      {/* ── TABLEAU ── */}
      <View style={s.tableOuter}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.cellNom}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>Points de controle</Text>
          </View>
          <View style={s.cellEtat}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>Etat</Text>
          </View>
          <View style={s.cellObs}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>observations</Text>
          </View>
        </View>

        {/* Points de controle */}
        {controle.points_controle.map((pt, i) => (
          <View key={i} style={i % 2 === 0 ? s.row : s.rowAlt}>
            <View style={s.cellNom}>
              <Text style={{ fontSize: 9 }}>{pt.nom}</Text>
            </View>
            <View style={s.cellEtat}>
              <RenderEtat etat={pt.etat} />
            </View>
            <View style={s.cellObs}>
              <Text style={{ fontSize: 9 }}>{pt.observation}</Text>
            </View>
          </View>
        ))}

        {/* Section ERP */}
        <View style={s.erpHeaderRow}>
          <View style={s.cellNom}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5 }}>normes ERP : CO48, EN16005</Text>
          </View>
          <View style={s.cellEtat}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: '#cc0000' }}>conformite*</Text>
          </View>
          <View style={s.cellObs}>
            <Text></Text>
          </View>
        </View>

        {controle.points_erp.map((pt, i) => (
          <View key={i} style={i % 2 === 0 ? s.row : s.rowAlt}>
            <View style={s.cellNom}>
              <Text style={{ fontFamily: 'Helvetica-Oblique', textDecoration: 'underline', fontSize: 9 }}>{pt.nom}</Text>
            </View>
            <View style={s.cellEtat}>
              {pt.conforme ? <CheckMark /> : <CrossMark />}
            </View>
            <View style={s.cellObs}>
              <Text></Text>
            </View>
          </View>
        ))}
      </View>

      {/* Notes */}
      <Text style={s.noteText}>
        *si a l&apos;issu de l intervention l un de ces points s&apos;est revele impossible a satisfaire veuillez engager d urgence toute action necessaire pour la remise aux normes.
      </Text>
      <Text style={s.noteSmall}>
        Correction {'->'} Intervention corrective realisee / <Text style={{ fontFamily: 'Helvetica-Bold' }}>Prevention</Text> {'->'} Intervention preventive conseillee
      </Text>

      {/* Photos de cette porte */}
      <PhotosSection photos={photos} title={`Photos - ${installation.repere}`} />

      <Footer pageNum={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// ============================================
// Page constat general
// ============================================
function PageConstat({
  rapport,
  pageNum,
  totalPages,
}: {
  rapport: RapportComplet;
  pageNum: number;
  totalPages: number;
}) {
  return (
    <Page size="A4" style={s.page}>
      {/* En-tete avec logo */}
      <View style={s.header}>
        <Image style={{ width: 90, height: 50 }} src={LOGO_AAC_BASE64} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9 }}>{rapport.numero_cm}</Text>
          <Text style={{ fontSize: 9 }}>LE {formatDate(rapport.date_intervention)}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{rapport.client.nom}</Text>
          {rapport.client.sous_titre && (
            <Text style={{ fontSize: 8 }}>{rapport.client.sous_titre}</Text>
          )}
        </View>
      </View>

      {/* Titre constat avec icone */}
      <View style={s.constatTitleRow}>
        <WrenchIcon />
        <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>
          Constat general de conformite
        </Text>
      </View>

      {/* Intro */}
      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 20 }}>
        A l&apos;issue de cette visite, et sauf indication contraire, il a ete constate que :
      </Text>

      {/* Items */}
      {rapport.constat_general.map((item, i) => (
        <View key={i} style={s.constatItem}>
          <View style={s.constatCheckBox}>
            {item.conforme ? <CheckMark /> : <CrossMark />}
          </View>
          <Text style={{ fontSize: 10, flex: 1 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{item.label} : </Text>
            {item.texte}
          </Text>
        </View>
      ))}

      {/* Conclusions */}
      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 25, marginBottom: 8 }}>
        Les controles realises attestent du bon fonctionnement et de la conformite des installations au jour de l&apos;intervention.
      </Text>
      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
        Toute observation particuliere a ete mentionnee dans les fiches individuelles ci-dessus.
      </Text>
      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
        Je confirme que les informations ci-dessus sont exactes et etablies en toute bonne foi:
      </Text>

      {/* Signatures côte à côte */}
      <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' }}>
        {/* Technicien */}
        <View style={{ width: '45%' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>Le technicien :</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', marginTop: 4 }}>
            {rapport.technicien}
          </Text>
          {rapport.signature_data ? (
            <Image style={{ width: 150, height: 80, marginTop: 10 }} src={rapport.signature_data} />
          ) : (
            <View style={{ width: 150, height: 80, marginTop: 10, borderWidth: 1, borderColor: '#999', borderStyle: 'dashed', backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 8, color: '#666' }}>Signature</Text>
            </View>
          )}
        </View>

        {/* Client */}
        <View style={{ width: '45%' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>Le client :</Text>
          {rapport.signature_client ? (
            <>
              <Image style={{ width: 150, height: 80, marginTop: 10 }} src={rapport.signature_client} />
              <Text style={{ fontSize: 9, marginTop: 6 }}>Date : {formatDate(rapport.date_intervention)}</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 9, marginTop: 6 }}>Signature :</Text>
              <View style={{ width: 180, height: 70, marginTop: 4, borderWidth: 0.5, borderColor: '#999', borderStyle: 'dashed' }} />
              <Text style={{ fontSize: 9, marginTop: 8 }}>Date : ____/____/________</Text>
            </>
          )}
        </View>
      </View>

      <Footer pageNum={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// ============================================
// Page intervention (rapport libre)
// ============================================
function PageIntervention({
  rapport,
  pageNum,
  totalPages,
}: {
  rapport: RapportComplet;
  pageNum: number;
  totalPages: number;
}) {
  const pieces = (rapport as any).pieces_utilisees || [];

  return (
    <Page size="A4" style={s.page}>
      {/* En-tete avec logo */}
      <View style={s.header}>
        <Image style={{ width: 90, height: 50 }} src={LOGO_AAC_BASE64} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9 }}>{rapport.numero_cm}</Text>
          <Text style={{ fontSize: 9 }}>LE {formatDate(rapport.date_intervention)}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{rapport.client.nom}</Text>
          {rapport.client.sous_titre && (
            <Text style={{ fontSize: 8 }}>{rapport.client.sous_titre}</Text>
          )}
        </View>
      </View>

      {/* Titre */}
      <Text style={s.title}>Rapport d&apos;intervention</Text>

      {/* Infos site */}
      <View style={s.infoBlock}>
        <View style={s.infoRow}>
          <Text style={{ width: 90, fontFamily: 'Helvetica-BoldOblique', fontSize: 9 }}>Site</Text>
          <Text style={{ fontSize: 9 }}>: {rapport.site.nom}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={{ width: 90, fontFamily: 'Helvetica-BoldOblique', fontSize: 9 }}>Technicien</Text>
          <Text style={{ fontSize: 9 }}>: {rapport.technicien}</Text>
        </View>
      </View>

      {/* Description du problème */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 6, textDecoration: 'underline' }}>
          Description du probleme
        </Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
          {(rapport as any).description_probleme || 'Non renseigne'}
        </Text>
      </View>

      {/* Travaux effectués */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 6, textDecoration: 'underline' }}>
          Travaux effectues
        </Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
          {(rapport as any).travaux_effectues || 'Non renseigne'}
        </Text>
      </View>

      {/* Pièces utilisées */}
      {pieces.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 6, textDecoration: 'underline' }}>
            Pieces et materiel utilise
          </Text>
          <View style={s.tableOuter}>
            {/* Header */}
            <View style={s.headerRow}>
              <View style={{ width: '50%', borderRightWidth: 0.5, borderRightColor: '#999', paddingLeft: 6, paddingVertical: 3, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>Designation</Text>
              </View>
              <View style={{ width: '15%', borderRightWidth: 0.5, borderRightColor: '#999', paddingVertical: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>Qte</Text>
              </View>
              <View style={{ width: '35%', paddingLeft: 6, paddingVertical: 3, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>Reference</Text>
              </View>
            </View>
            {/* Lignes */}
            {pieces.map((piece: any, i: number) => (
              <View key={i} style={i % 2 === 0 ? s.row : s.rowAlt}>
                <View style={{ width: '50%', borderRightWidth: 0.5, borderRightColor: '#999', paddingLeft: 6, paddingVertical: 3, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 9 }}>{piece.nom}</Text>
                </View>
                <View style={{ width: '15%', borderRightWidth: 0.5, borderRightColor: '#999', paddingVertical: 3, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 9 }}>{piece.quantite}</Text>
                </View>
                <View style={{ width: '35%', paddingLeft: 6, paddingVertical: 3, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 9 }}>{piece.reference || ''}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Photos */}
      <PhotosSection photos={((rapport as any).photos || []).filter((p: PhotoItem) => p.context === 'intervention')} title="Photos" />

      {/* Signatures côte à côte */}
      <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' }}>
        {/* Technicien */}
        <View style={{ width: '45%' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>Le technicien :</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', marginTop: 4 }}>
            {rapport.technicien}
          </Text>
          {rapport.signature_data ? (
            <Image style={{ width: 150, height: 80, marginTop: 10 }} src={rapport.signature_data} />
          ) : (
            <View style={{ width: 150, height: 80, marginTop: 10, borderWidth: 1, borderColor: '#999', borderStyle: 'dashed', backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 8, color: '#666' }}>Signature</Text>
            </View>
          )}
        </View>

        {/* Client */}
        <View style={{ width: '45%' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>Le client :</Text>
          {rapport.signature_client ? (
            <>
              <Image style={{ width: 150, height: 80, marginTop: 10 }} src={rapport.signature_client} />
              <Text style={{ fontSize: 9, marginTop: 6 }}>Date : {formatDate(rapport.date_intervention)}</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 9, marginTop: 6 }}>Signature :</Text>
              <View style={{ width: 180, height: 70, marginTop: 4, borderWidth: 0.5, borderColor: '#999', borderStyle: 'dashed' }} />
              <Text style={{ fontSize: 9, marginTop: 8 }}>Date : ____/____/________</Text>
            </>
          )}
        </View>
      </View>

      <Footer pageNum={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// ============================================
// DOCUMENT PRINCIPAL
// ============================================
export function RapportPDF({ rapport }: { rapport: RapportComplet }) {
  const isIntervention = (rapport as any).type_rapport === 'intervention';

  if (isIntervention) {
    return (
      <Document
        title={`${rapport.numero_cm} - ${rapport.client.nom}`}
        author={SOCIETE.nom}
      >
        <PageIntervention rapport={rapport} pageNum={1} totalPages={1} />
      </Document>
    );
  }

  const totalPages = rapport.controles.length + 1;

  return (
    <Document
      title={`${rapport.numero_cm} - ${rapport.client.nom}`}
      author={SOCIETE.nom}
    >
      {rapport.controles.map((controle, index) => {
        const doorPhotos = ((rapport as any).photos || []).filter(
          (p: PhotoItem) => p.context === `controle:${controle.installation_id}`
        );
        return (
          <PageControle
            key={controle.id}
            rapport={rapport}
            controle={controle}
            installation={controle.installation}
            pageNum={index + 1}
            totalPages={totalPages}
            photos={doorPhotos}
          />
        );
      })}
      <PageConstat
        rapport={rapport}
        pageNum={totalPages}
        totalPages={totalPages}
      />
    </Document>
  );
}
