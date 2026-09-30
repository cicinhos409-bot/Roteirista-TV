export type StructureType = 'A' | 'B' | 'C' | 'D';

export interface StructureInfo {
  id: StructureType;
  name: string;
  subtitle: string;
  durationRange: string;
  itemsRange: string;
  description: string;
  idealFor: string[];
}

export interface ScriptProject {
  id: string;
  title: string;
  durationMinutes: number;
  structureType: StructureType;
  channelName: string;
  observations: string;
  rawScript: string;
  createdAt: string;
  wordCount: number;
  estimatedMinutes: number;
}

export interface CastMember {
  number?: string;
  name: string;
  roleAndSoap: string;
  ageThenAndNow: string;
  currentStatus: string;
  source?: string;
}

export interface PublicationPackage {
  titles: string[];
  thumbText: string;
  thumbConcept: string;
  description: string;
  tags: string[];
}

export interface CueItem {
  type: 'CENA' | 'IMAGEM' | 'VERIFICAR';
  text: string;
  timestamp?: string;
}
