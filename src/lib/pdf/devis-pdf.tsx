/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { LigneDevis, TypeLigne } from '@/lib/types';
import { SOCIETE, TYPE_LIGNE_LABELS } from '@/lib/types';
import { LOGO_AAC_BASE64 } from './logo';

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 14,
  },
  infoBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCol: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  infoLabel: {
    width: 80,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
  },
  // Tableau
  tableOuter: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    minHeight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  groupHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    minHeight: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#bbb',
  },
  row: {
    flexDirection: 'row',
    minHeight: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  rowAlt: {
    flexDirection: 'row',
    minHeight: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  // Cellules tableau devis
  cellDesignation: {
    width: '45%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingLeft: 5,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  cellRef: {
    width: '15%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingLeft: 4,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  cellQty: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellUnite: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPU: {
    width: '12%',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    paddingRight: 4,
    paddingVertical: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cellTotal: {
    width: '12%',
    paddingRight: 4,
    paddingVertical: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // Récapitulatif
  recapBlock: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
    width: '40%',
  },
  recapLabel: {
    flex: 1,
    fontSize: 9,
    color: '#444',
  },
  recapValue: {
    width: 80,
    textAlign: 'right',
    fontSize: 9,
  },
  recapTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '40%',
  },
  recapTotalLabel: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  recapTotalValue: {
    width: 80,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  // Notes
  notesBlock: {
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#ccc',
    padding: 6,
  },
  notesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: '#444',
  },
  validiteText: {
    fontSize: 8,
    marginTop: 6,
    fontFamily: 'Helvetica-Bold',
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
});

// ============================================
// HELPERS
// ============================================
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function formatMontant(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' F';
}

// ============================================
// TYPES ET GROUPES
// ============================================
const TYPES_ORDRE: TypeLigne[] = ['materiel', 'main_oeuvre', 'deplacement', 'autre'];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
interface DevisPDFProps {
  numeroCm: string;
  dateIntervention: string;
  clientNom: string;
  siteNom: string;
  siteAdresse: string | null;
  travaux_envisages: string;
  lignes: LigneDevis[];
  notes: string;
  validite: number;
}

export function DevisPDF({
  numeroCm,
  dateIntervention,
  clientNom,
  siteNom,
  siteAdresse,
  travaux_envisages,
  lignes,
  notes,
  validite,
}: DevisPDFProps) {
  const totalHT = lignes.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── EN-TÊTE ── */}
        <View style={s.header}>
          <Image style={{ width: 90, height: 50 }} src={LOGO_AAC_BASE64} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{SOCIETE.nom}</Text>
            <Text style={{ fontSize: 8 }}>RIDET {SOCIETE.ridet}</Text>
            <Text style={{ fontSize: 8 }}>RC/Décennale : {SOCIETE.rc}</Text>
            <Text style={{ fontSize: 8 }}>Tél. {SOCIETE.telephone}</Text>
            <Text style={{ fontSize: 8 }}>{SOCIETE.mail}</Text>
          </View>
        </View>

        {/* ── TITRE ── */}
        <Text style={s.title}>DEVIS N° {numeroCm}</Text>

        {/* ── BLOC INFO ── */}
        <View style={s.infoBlock}>
          <View style={s.infoCol}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Client</Text>
              <Text style={s.infoValue}>: {clientNom}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Site</Text>
              <Text style={s.infoValue}>: {siteNom}</Text>
            </View>
            {siteAdresse ? (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Adresse</Text>
                <Text style={s.infoValue}>: {siteAdresse}</Text>
              </View>
            ) : null}
          </View>
          <View style={s.infoCol}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Date</Text>
              <Text style={s.infoValue}>: {formatDate(dateIntervention)}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Validité</Text>
              <Text style={s.infoValue}>: {validite} jours</Text>
            </View>
            {travaux_envisages ? (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Objet</Text>
                <Text style={s.infoValue}>: {travaux_envisages}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── TABLEAU DES LIGNES ── */}
        <View style={s.tableOuter}>
          {/* En-tête colonnes */}
          <View style={s.headerRow}>
            <View style={s.cellDesignation}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>Désignation</Text>
            </View>
            <View style={s.cellRef}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>Réf.</Text>
            </View>
            <View style={s.cellQty}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>Qté</Text>
            </View>
            <View style={s.cellUnite}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>Unité</Text>
            </View>
            <View style={s.cellPU}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>P.U. HT</Text>
            </View>
            <View style={s.cellTotal}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>Total HT</Text>
            </View>
          </View>

          {/* Lignes groupées par type */}
          {TYPES_ORDRE.map((type) => {
            const lignesType = lignes.filter((l) => l.type === type);
            if (lignesType.length === 0) return null;
            return (
              <React.Fragment key={type}>
                {/* En-tête de groupe */}
                <View style={s.groupHeaderRow}>
                  <View style={{ flex: 1, paddingLeft: 5, paddingVertical: 3, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>
                      {TYPE_LIGNE_LABELS[type].toUpperCase()}
                    </Text>
                  </View>
                </View>
                {/* Lignes du groupe */}
                {lignesType.map((l, idx) => {
                  const rowStyle = idx % 2 === 1 ? s.rowAlt : s.row;
                  const total = l.quantite * l.prix_unitaire;
                  return (
                    <View key={l.id} style={rowStyle}>
                      <View style={s.cellDesignation}>
                        <Text style={{ fontSize: 8 }}>{l.description}</Text>
                      </View>
                      <View style={s.cellRef}>
                        <Text style={{ fontSize: 7, color: '#555' }}>{l.reference}</Text>
                      </View>
                      <View style={s.cellQty}>
                        <Text style={{ fontSize: 8 }}>{l.quantite}</Text>
                      </View>
                      <View style={s.cellUnite}>
                        <Text style={{ fontSize: 8 }}>{l.unite}</Text>
                      </View>
                      <View style={s.cellPU}>
                        <Text style={{ fontSize: 8 }}>{formatMontant(l.prix_unitaire)}</Text>
                      </View>
                      <View style={s.cellTotal}>
                        <Text style={{ fontSize: 8 }}>{formatMontant(total)}</Text>
                      </View>
                    </View>
                  );
                })}
              </React.Fragment>
            );
          })}
        </View>

        {/* ── RÉCAPITULATIF ── */}
        <View style={s.recapBlock}>
          {TYPES_ORDRE.map((type) => {
            const sous = lignes
              .filter((l) => l.type === type)
              .reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);
            if (sous === 0) return null;
            return (
              <View key={type} style={s.recapRow}>
                <Text style={s.recapLabel}>{TYPE_LIGNE_LABELS[type]}</Text>
                <Text style={s.recapValue}>{formatMontant(sous)}</Text>
              </View>
            );
          })}
          <View style={s.recapTotalRow}>
            <Text style={s.recapTotalLabel}>Total HT</Text>
            <Text style={s.recapTotalValue}>{formatMontant(totalHT)}</Text>
          </View>
        </View>

        {/* ── NOTES / CONDITIONS ── */}
        {notes ? (
          <View style={s.notesBlock}>
            <Text style={s.notesTitle}>Notes / Conditions</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        ) : null}

        {/* ── PHRASE FINALE ── */}
        <Text style={s.validiteText}>
          Devis valable {validite} jours. Accord à retourner signé avec mention &quot;Bon pour accord&quot;.
        </Text>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <View style={{ width: '33%' }}>
            <Text>{SOCIETE.nom}</Text>
            <Text>RIDET    {SOCIETE.ridet}</Text>
            <Text>RC/Decennale : {SOCIETE.rc}</Text>
          </View>
          <View style={{ width: '33%', textAlign: 'center' }}>
            <Text>Telephone {SOCIETE.telephone}</Text>
            <Text>Mail {SOCIETE.mail}</Text>
          </View>
          <View style={{ width: '33%', textAlign: 'right' }}>
            <Text>Code APE {SOCIETE.codeApe}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
