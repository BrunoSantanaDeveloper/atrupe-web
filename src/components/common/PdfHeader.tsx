'use client'

// Component
import { Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer'

// Utils
import { maskCnpj } from '@/lib/utils'
import { getProxiedImageUrl } from '@/lib/image-proxy'

// Icons
import {
  EmailIcon,
  WebsiteIcon,
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon,
} from '@/assets/icons/PdfIcons'

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    padding: 30,
    height: 76,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  socialInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '25%',
    paddingRight: 0,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'flex-end',
  },
  textRightSmall: {
    fontSize: 7,
    textAlign: 'right',
  },
  companyLogoContainer: {
    width: '35%',
  },
  companyInfoLarge: {
    fontSize: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
    width: '50%',
  },
})

type CompanyAddress = {
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

type SocialNetworks = {
  instagram?: string
  facebook?: string
  linkedin?: string
}

type CompanyInfo = {
  name?: string
  cnpj?: string
  logo?: string
  logoUrl?: string
  email?: string
  siteUrl?: string
  address?: CompanyAddress
  socialNetworks?: SocialNetworks
}

interface Props {
  company?: CompanyInfo
}

export function PdfHeader({ company }: Props) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.companyLogoContainer}>
        <PDFImage
          src={
            getProxiedImageUrl(company?.logo || company?.logoUrl) ||
            '/src/assets/icons/companyIconPlaceholder.png'
          }
          style={styles.logo}
        />
      </View>
      <View style={styles.companyInfoLarge}>
        <Text style={styles.companyName}>{company?.name}</Text>
        {company?.cnpj && <Text>{maskCnpj(company?.cnpj)}</Text>}
        <Text>
          {[company?.address?.street, company?.address?.number]
            .filter(Boolean)
            .join(', ')}
        </Text>
        <Text>
          {[
            company?.address?.neighborhood,
            company?.address?.city,
            company?.address?.state,
          ]
            .filter(Boolean)
            .join(', ')}
          {company?.address?.city || company?.address?.state ? '.' : ''}
        </Text>
      </View>
      <View style={styles.socialInfo}>
        {company?.socialNetworks?.instagram && (
          <View style={styles.flexRow}>
            <Text style={styles.textRightSmall}>
              {company?.socialNetworks?.instagram}
            </Text>
            <InstagramIcon />
          </View>
        )}
        {company?.socialNetworks?.facebook && (
          <View style={styles.flexRow}>
            <Text style={styles.textRightSmall}>
              {company?.socialNetworks?.facebook}
            </Text>
            <FacebookIcon />
          </View>
        )}
        {company?.socialNetworks?.linkedin && (
          <View style={styles.flexRow}>
            <Text style={styles.textRightSmall}>
              {company?.socialNetworks?.linkedin}
            </Text>
            <LinkedinIcon />
          </View>
        )}
        {company?.siteUrl && (
          <View style={styles.flexRow}>
            <Text style={styles.textRightSmall}>{company?.siteUrl}</Text>
            <WebsiteIcon />
          </View>
        )}
        {company?.email && (
          <View style={styles.flexRow}>
            <Text style={styles.textRightSmall}>{company?.email}</Text>
            <EmailIcon />
          </View>
        )}
      </View>
    </View>
  )
}
