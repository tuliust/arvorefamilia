export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_display_name: string | null
          actor_pessoa_id: string | null
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_display_name?: string | null
          actor_pessoa_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_display_name?: string | null
          actor_pessoa_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_pessoa_id_fkey"
            columns: ["actor_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_actor_pessoa_id_fkey"
            columns: ["actor_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notification_catalogs: {
        Row: {
          automations: Json
          catalog_key: string
          created_at: string
          created_by: string | null
          frequency_options: Json
          id: string
          metadata: Json
          notification_templates: Json
          notification_types: Json
          recipient_groups: Json
          suggestions: Json
          theme_options: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          automations?: Json
          catalog_key?: string
          created_at?: string
          created_by?: string | null
          frequency_options?: Json
          id?: string
          metadata?: Json
          notification_templates?: Json
          notification_types?: Json
          recipient_groups?: Json
          suggestions?: Json
          theme_options?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          automations?: Json
          catalog_key?: string
          created_at?: string
          created_by?: string | null
          frequency_options?: Json
          id?: string
          metadata?: Json
          notification_templates?: Json
          notification_types?: Json
          recipient_groups?: Json
          suggestions?: Json
          theme_options?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_notification_configurations: {
        Row: {
          active_overrides: Json
          channel_overrides: Json
          config_key: string
          content_overrides: Json
          created_at: string
          created_by: string | null
          custom_definitions: Json
          deleted_type_ids: Json
          frequency_overrides: Json
          id: string
          recipient_overrides: Json
          theme_overrides: Json
          updated_at: string
          updated_by: string | null
          variable_overrides: Json
          variable_settings: Json
        }
        Insert: {
          active_overrides?: Json
          channel_overrides?: Json
          config_key?: string
          content_overrides?: Json
          created_at?: string
          created_by?: string | null
          custom_definitions?: Json
          deleted_type_ids?: Json
          frequency_overrides?: Json
          id?: string
          recipient_overrides?: Json
          theme_overrides?: Json
          updated_at?: string
          updated_by?: string | null
          variable_overrides?: Json
          variable_settings?: Json
        }
        Update: {
          active_overrides?: Json
          channel_overrides?: Json
          config_key?: string
          content_overrides?: Json
          created_at?: string
          created_by?: string | null
          custom_definitions?: Json
          deleted_type_ids?: Json
          frequency_overrides?: Json
          id?: string
          recipient_overrides?: Json
          theme_overrides?: Json
          updated_at?: string
          updated_by?: string | null
          variable_overrides?: Json
          variable_settings?: Json
        }
        Relationships: []
      }
      arquivos_historicos: {
        Row: {
          ano: string | null
          categoria_evento: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          mime_type: string | null
          ordem: number | null
          pessoa_id: string
          relacionamento_id: string | null
          storage_bucket: string | null
          storage_path: string | null
          tipo: string | null
          titulo: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          ano?: string | null
          categoria_evento?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          mime_type?: string | null
          ordem?: number | null
          pessoa_id: string
          relacionamento_id?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          ano?: string | null
          categoria_evento?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          mime_type?: string | null
          ordem?: number | null
          pessoa_id?: string
          relacionamento_id?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_historicos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_historicos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_historicos_relacionamento_id_fkey"
            columns: ["relacionamento_id"]
            isOneToOne: false
            referencedRelation: "relacionamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      family_memory_wall_posts: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      forum_categorias: {
        Row: {
          ativa: boolean | null
          cor_token: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          cor_token?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          cor_token?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_comentarios: {
        Row: {
          autor_id: string
          conteudo: string
          created_at: string | null
          id: string
          resposta_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          autor_id: string
          conteudo: string
          created_at?: string | null
          id?: string
          resposta_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          resposta_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comentarios_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "forum_respostas"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_denuncias: {
        Row: {
          alvo_id: string
          alvo_tipo: string
          created_at: string | null
          denunciante_id: string
          detalhes: string | null
          id: string
          motivo: string
          status: string
        }
        Insert: {
          alvo_id: string
          alvo_tipo: string
          created_at?: string | null
          denunciante_id: string
          detalhes?: string | null
          id?: string
          motivo: string
          status?: string
        }
        Update: {
          alvo_id?: string
          alvo_tipo?: string
          created_at?: string | null
          denunciante_id?: string
          detalhes?: string | null
          id?: string
          motivo?: string
          status?: string
        }
        Relationships: []
      }
      forum_reacoes: {
        Row: {
          alvo_id: string
          alvo_tipo: string
          created_at: string | null
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          alvo_id: string
          alvo_tipo: string
          created_at?: string | null
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          alvo_id?: string
          alvo_tipo?: string
          created_at?: string | null
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_respostas: {
        Row: {
          aceita_como_solucao: boolean | null
          autor_id: string
          conteudo: string
          created_at: string | null
          id: string
          status: string
          topico_id: string
          updated_at: string | null
        }
        Insert: {
          aceita_como_solucao?: boolean | null
          autor_id: string
          conteudo: string
          created_at?: string | null
          id?: string
          status?: string
          topico_id: string
          updated_at?: string | null
        }
        Update: {
          aceita_como_solucao?: boolean | null
          autor_id?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          status?: string
          topico_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_respostas_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "forum_topicos"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topico_pessoas: {
        Row: {
          created_at: string
          id: string
          pessoa_id: string
          topico_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pessoa_id: string
          topico_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pessoa_id?: string
          topico_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topico_pessoas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topico_pessoas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topico_pessoas_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "forum_topicos"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topicos: {
        Row: {
          autor_id: string
          categoria_id: string | null
          conteudo: string
          created_at: string | null
          destacado: boolean | null
          fixado: boolean | null
          id: string
          pessoa_relacionada_id: string | null
          slug: string
          status: string
          tipo: string
          titulo: string
          updated_at: string | null
          visualizacoes: number | null
        }
        Insert: {
          autor_id: string
          categoria_id?: string | null
          conteudo: string
          created_at?: string | null
          destacado?: boolean | null
          fixado?: boolean | null
          id?: string
          pessoa_relacionada_id?: string | null
          slug: string
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string | null
          visualizacoes?: number | null
        }
        Update: {
          autor_id?: string
          categoria_id?: string | null
          conteudo?: string
          created_at?: string | null
          destacado?: boolean | null
          fixado?: boolean | null
          id?: string
          pessoa_relacionada_id?: string | null
          slug?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "forum_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topicos_pessoa_relacionada_id_fkey"
            columns: ["pessoa_relacionada_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topicos_pessoa_relacionada_id_fkey"
            columns: ["pessoa_relacionada_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_connections: {
        Row: {
          access_token: string
          ativo: boolean
          connected_at: string | null
          expires_at: string | null
          google_account_email: string | null
          google_calendar_id: string
          id: string
          last_sync_at: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          ativo?: boolean
          connected_at?: string | null
          expires_at?: string | null
          google_account_email?: string | null
          google_calendar_id?: string
          id?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          ativo?: boolean
          connected_at?: string | null
          expires_at?: string | null
          google_account_email?: string | null
          google_calendar_id?: string
          id?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string
          state: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          state: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          state?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_synced_events: {
        Row: {
          created_at: string | null
          event_day: number
          event_month: number
          event_type: string
          family_event_key: string
          google_calendar_id: string
          google_event_id: string
          id: string
          pessoa_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_day: number
          event_month: number
          event_type: string
          family_event_key: string
          google_calendar_id?: string
          google_event_id: string
          id?: string
          pessoa_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_day?: number
          event_month?: number
          event_type?: string
          family_event_key?: string
          google_calendar_id?: string
          google_event_id?: string
          id?: string
          pessoa_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_synced_events_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_synced_events_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_usuario: {
        Row: {
          canal: string
          created_at: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string
          metadata: Json
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          canal?: string
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem: string
          metadata?: Json
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          canal?: string
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string
          metadata?: Json
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_dispatch_logs: {
        Row: {
          canal: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json
          notification_id: string | null
          provider: string | null
          status: string
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          canal: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          notification_id?: string | null
          provider?: string | null
          status?: string
          tipo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          canal?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          notification_id?: string | null
          provider?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_dispatch_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notificacoes_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "notification_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_group_rules: {
        Row: {
          created_at: string
          enabled: boolean
          group_id: string
          id: string
          notification_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          group_id: string
          id?: string
          notification_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          group_id?: string
          id?: string
          notification_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_group_rules_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "notification_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_groups: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_occurrences: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          notification_id: string | null
          occurrence_date: string
          occurrence_key: string
          status: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          notification_id?: string | null
          occurrence_date: string
          occurrence_key: string
          status?: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          notification_id?: string | null
          occurrence_date?: string
          occurrence_key?: string
          status?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_occurrences_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notificacoes_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      parentescos_calculados: {
        Row: {
          calculado_em: string
          caminho_ids: string[]
          caminho_relacoes: string[]
          codigo_parentesco: string | null
          created_at: string
          descricao: string | null
          destino_pessoa_id: string | null
          distancia: number | null
          encontrado: boolean
          grau: number | null
          id: string
          lado: string | null
          linha: string | null
          metadata: Json
          nome_parentesco: string | null
          origem_pessoa_id: string | null
          pessoa_destino_id: string
          pessoa_origem_id: string
          tipo_parentesco: string | null
          updated_at: string
        }
        Insert: {
          calculado_em?: string
          caminho_ids?: string[]
          caminho_relacoes?: string[]
          codigo_parentesco?: string | null
          created_at?: string
          descricao?: string | null
          destino_pessoa_id?: string | null
          distancia?: number | null
          encontrado?: boolean
          grau?: number | null
          id?: string
          lado?: string | null
          linha?: string | null
          metadata?: Json
          nome_parentesco?: string | null
          origem_pessoa_id?: string | null
          pessoa_destino_id: string
          pessoa_origem_id: string
          tipo_parentesco?: string | null
          updated_at?: string
        }
        Update: {
          calculado_em?: string
          caminho_ids?: string[]
          caminho_relacoes?: string[]
          codigo_parentesco?: string | null
          created_at?: string
          descricao?: string | null
          destino_pessoa_id?: string | null
          distancia?: number | null
          encontrado?: boolean
          grau?: number | null
          id?: string
          lado?: string | null
          linha?: string | null
          metadata?: Json
          nome_parentesco?: string | null
          origem_pessoa_id?: string | null
          pessoa_destino_id?: string
          pessoa_origem_id?: string
          tipo_parentesco?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parentescos_calculados_destino_pessoa_id_fkey"
            columns: ["destino_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_destino_pessoa_id_fkey"
            columns: ["destino_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_origem_pessoa_id_fkey"
            columns: ["origem_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_origem_pessoa_id_fkey"
            columns: ["origem_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_pessoa_destino_id_fkey"
            columns: ["pessoa_destino_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_pessoa_destino_id_fkey"
            columns: ["pessoa_destino_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_pessoa_origem_id_fkey"
            columns: ["pessoa_origem_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parentescos_calculados_pessoa_origem_id_fkey"
            columns: ["pessoa_origem_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      person_events: {
        Row: {
          created_at: string
          data_evento: string | null
          descricao: string | null
          id: string
          local: string | null
          ordem: number
          pessoa_id: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          local?: string | null
          ordem?: number
          pessoa_id: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          local?: string | null
          ordem?: number
          pessoa_id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_events_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_events_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      person_generated_insights: {
        Row: {
          conteudo: Json
          created_at: string
          data_nascimento: string
          error_message: string | null
          id: string
          modelo: string | null
          pessoa_id: string
          prompt_version: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          conteudo: Json
          created_at?: string
          data_nascimento: string
          error_message?: string | null
          id?: string
          modelo?: string | null
          pessoa_id: string
          prompt_version?: string
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          conteudo?: Json
          created_at?: string
          data_nascimento?: string
          error_message?: string | null
          id?: string
          modelo?: string | null
          pessoa_id?: string
          prompt_version?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_generated_insights_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_generated_insights_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      person_profile_questionnaire_answers: {
        Row: {
          answers: Json
          created_at: string
          custom_traits: string | null
          generated_questions: Json
          id: string
          last_generated_hash: string | null
          memorial_mode: boolean
          pessoa_id: string
          selected_badges: Json
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          custom_traits?: string | null
          generated_questions?: Json
          id?: string
          last_generated_hash?: string | null
          memorial_mode?: boolean
          pessoa_id: string
          selected_badges?: Json
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          custom_traits?: string | null
          generated_questions?: Json
          id?: string
          last_generated_hash?: string | null
          memorial_mode?: boolean
          pessoa_id?: string
          selected_badges?: Json
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_profile_questionnaire_answers_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_profile_questionnaire_answers_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      person_profile_suggestions: {
        Row: {
          admin_note: string | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          created_at: string
          id: string
          requester_pessoa_id: string | null
          requester_user_id: string
          status: string
          suggestion_text: string
          target_pessoa_id: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          created_at?: string
          id?: string
          requester_pessoa_id?: string | null
          requester_user_id: string
          status?: string
          suggestion_text: string
          target_pessoa_id: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          created_at?: string
          id?: string
          requester_pessoa_id?: string | null
          requester_user_id?: string
          status?: string
          suggestion_text?: string
          target_pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_profile_suggestions_requester_pessoa_id_fkey"
            columns: ["requester_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_profile_suggestions_requester_pessoa_id_fkey"
            columns: ["requester_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_profile_suggestions_target_pessoa_id_fkey"
            columns: ["target_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_profile_suggestions_target_pessoa_id_fkey"
            columns: ["target_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      person_responsible_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          managed_pessoa_id: string
          notes: string | null
          responsibility_role: string
          responsible_pessoa_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          managed_pessoa_id: string
          notes?: string | null
          responsibility_role?: string
          responsible_pessoa_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          managed_pessoa_id?: string
          notes?: string | null
          responsibility_role?: string
          responsible_pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_responsible_links_managed_pessoa_id_fkey"
            columns: ["managed_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_responsible_links_managed_pessoa_id_fkey"
            columns: ["managed_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_responsible_links_responsible_pessoa_id_fkey"
            columns: ["responsible_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_responsible_links_responsible_pessoa_id_fkey"
            columns: ["responsible_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      person_visibility_settings: {
        Row: {
          arquivos_historicos_visivel: boolean
          arvore_visivel: boolean
          calendario_visivel: boolean
          created_at: string
          curiosidades_visivel: boolean
          dados_sensiveis_visiveis: boolean
          forum_visivel: boolean
          id: string
          mapa_familiar_visivel: boolean
          perfil_visivel: boolean
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          arquivos_historicos_visivel?: boolean
          arvore_visivel?: boolean
          calendario_visivel?: boolean
          created_at?: string
          curiosidades_visivel?: boolean
          dados_sensiveis_visiveis?: boolean
          forum_visivel?: boolean
          id?: string
          mapa_familiar_visivel?: boolean
          perfil_visivel?: boolean
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          arquivos_historicos_visivel?: boolean
          arvore_visivel?: boolean
          calendario_visivel?: boolean
          created_at?: string
          curiosidades_visivel?: boolean
          dados_sensiveis_visiveis?: boolean
          forum_visivel?: boolean
          id?: string
          mapa_familiar_visivel?: boolean
          perfil_visivel?: boolean
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_visibility_settings_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_visibility_settings_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoa_social_profiles: {
        Row: {
          created_at: string
          exibir_no_perfil: boolean
          id: string
          perfil: string
          pessoa_id: string
          rede: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          exibir_no_perfil?: boolean
          id?: string
          perfil: string
          pessoa_id: string
          rede: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          exibir_no_perfil?: boolean
          id?: string
          perfil?: string
          pessoa_id?: string
          rede?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoa_social_profiles_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoa_social_profiles_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          arquivos_historicos: Json
          complemento: string | null
          cor_bg_card: string | null
          created_at: string | null
          curiosidades: string | null
          data_falecimento: string | null
          data_nascimento: string | null
          endereco: string | null
          falecido: boolean
          foto_principal_url: string | null
          genero: string | null
          geracao_sociologica: string | null
          humano_ou_pet: string
          id: string
          instagram_url: string | null
          instagram_usuario: string | null
          lado: string
          local_atual: string | null
          local_atual_exterior: boolean
          local_falecimento: string | null
          local_falecimento_exterior: boolean
          local_nascimento: string | null
          local_nascimento_exterior: boolean
          manual_generation: number | null
          minibio: string | null
          nome_completo: string
          permitir_exibir_data_nascimento: boolean
          permitir_exibir_endereco: boolean
          permitir_exibir_instagram: boolean | null
          permitir_exibir_rede_social: boolean
          permitir_exibir_telefone: boolean
          permitir_mensagens_whatsapp: boolean | null
          profissao: string | null
          rede_social: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          arquivos_historicos?: Json
          complemento?: string | null
          cor_bg_card?: string | null
          created_at?: string | null
          curiosidades?: string | null
          data_falecimento?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          falecido?: boolean
          foto_principal_url?: string | null
          genero?: string | null
          geracao_sociologica?: string | null
          humano_ou_pet?: string
          id?: string
          instagram_url?: string | null
          instagram_usuario?: string | null
          lado?: string
          local_atual?: string | null
          local_atual_exterior?: boolean
          local_falecimento?: string | null
          local_falecimento_exterior?: boolean
          local_nascimento?: string | null
          local_nascimento_exterior?: boolean
          manual_generation?: number | null
          minibio?: string | null
          nome_completo: string
          permitir_exibir_data_nascimento?: boolean
          permitir_exibir_endereco?: boolean
          permitir_exibir_instagram?: boolean | null
          permitir_exibir_rede_social?: boolean
          permitir_exibir_telefone?: boolean
          permitir_mensagens_whatsapp?: boolean | null
          profissao?: string | null
          rede_social?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          arquivos_historicos?: Json
          complemento?: string | null
          cor_bg_card?: string | null
          created_at?: string | null
          curiosidades?: string | null
          data_falecimento?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          falecido?: boolean
          foto_principal_url?: string | null
          genero?: string | null
          geracao_sociologica?: string | null
          humano_ou_pet?: string
          id?: string
          instagram_url?: string | null
          instagram_usuario?: string | null
          lado?: string
          local_atual?: string | null
          local_atual_exterior?: boolean
          local_falecimento?: string | null
          local_falecimento_exterior?: boolean
          local_nascimento?: string | null
          local_nascimento_exterior?: boolean
          manual_generation?: number | null
          minibio?: string | null
          nome_completo?: string
          permitir_exibir_data_nascimento?: boolean
          permitir_exibir_endereco?: boolean
          permitir_exibir_instagram?: boolean | null
          permitir_exibir_rede_social?: boolean
          permitir_exibir_telefone?: boolean
          permitir_mensagens_whatsapp?: boolean | null
          profissao?: string | null
          rede_social?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preferencias_notificacao: {
        Row: {
          created_at: string
          id: string
          receber_aniversarios: boolean
          receber_avisos_gerais: boolean
          receber_datas_memoria: boolean
          receber_email: boolean
          receber_email_datas_especiais: boolean
          receber_email_evento_historico_familia: boolean
          receber_email_novas_mensagens_forum: boolean
          receber_email_novo_usuario: boolean
          receber_email_novos_registros_historicos: boolean
          receber_eventos: boolean
          receber_push: boolean
          receber_whatsapp: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          receber_aniversarios?: boolean
          receber_avisos_gerais?: boolean
          receber_datas_memoria?: boolean
          receber_email?: boolean
          receber_email_datas_especiais?: boolean
          receber_email_evento_historico_familia?: boolean
          receber_email_novas_mensagens_forum?: boolean
          receber_email_novo_usuario?: boolean
          receber_email_novos_registros_historicos?: boolean
          receber_eventos?: boolean
          receber_push?: boolean
          receber_whatsapp?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          receber_aniversarios?: boolean
          receber_avisos_gerais?: boolean
          receber_datas_memoria?: boolean
          receber_email?: boolean
          receber_email_datas_especiais?: boolean
          receber_email_evento_historico_familia?: boolean
          receber_email_novas_mensagens_forum?: boolean
          receber_email_novo_usuario?: boolean
          receber_email_novos_registros_historicos?: boolean
          receber_eventos?: boolean
          receber_push?: boolean
          receber_whatsapp?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_control_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          requester_pessoa_id: string | null
          requester_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_pessoa_id: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          requester_pessoa_id?: string | null
          requester_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_pessoa_id: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          requester_pessoa_id?: string | null
          requester_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_control_requests_requester_pessoa_id_fkey"
            columns: ["requester_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_control_requests_requester_pessoa_id_fkey"
            columns: ["requester_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_control_requests_target_pessoa_id_fkey"
            columns: ["target_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_control_requests_target_pessoa_id_fkey"
            columns: ["target_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          nome_exibicao: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          nome_exibicao?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nome_exibicao?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      qa_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          order_index: number
          short_title: string | null
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          short_title?: string | null
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          short_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      qa_items: {
        Row: {
          answer: string
          category_id: string
          created_at: string
          created_by: string | null
          id: string
          is_featured: boolean
          keywords: string[]
          order_index: number
          published_at: string | null
          question: string
          related_page_label: string | null
          related_page_path: string | null
          slug: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer: string
          category_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_featured?: boolean
          keywords?: string[]
          order_index?: number
          published_at?: string | null
          question: string
          related_page_label?: string | null
          related_page_path?: string | null
          slug: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer?: string
          category_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_featured?: boolean
          keywords?: string[]
          order_index?: number
          published_at?: string | null
          question?: string
          related_page_label?: string | null
          related_page_path?: string | null
          slug?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "qa_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_parentesco: {
        Row: {
          ativo: boolean
          caminho: string[]
          codigo: string
          created_at: string
          descricao_curta_template: string | null
          descricao_template: string
          grau: number | null
          id: string
          lado: string | null
          linha: string | null
          nome: string
          nome_feminino: string | null
          nome_masculino: string | null
          nome_plural: string | null
        }
        Insert: {
          ativo?: boolean
          caminho: string[]
          codigo: string
          created_at?: string
          descricao_curta_template?: string | null
          descricao_template: string
          grau?: number | null
          id?: string
          lado?: string | null
          linha?: string | null
          nome: string
          nome_feminino?: string | null
          nome_masculino?: string | null
          nome_plural?: string | null
        }
        Update: {
          ativo?: boolean
          caminho?: string[]
          codigo?: string
          created_at?: string
          descricao_curta_template?: string | null
          descricao_template?: string
          grau?: number | null
          id?: string
          lado?: string | null
          linha?: string | null
          nome?: string
          nome_feminino?: string | null
          nome_masculino?: string | null
          nome_plural?: string | null
        }
        Relationships: []
      }
      relacionamentos: {
        Row: {
          ativo: boolean
          created_at: string | null
          data_casamento: string | null
          data_separacao: string | null
          id: string
          local_casamento: string | null
          local_separacao: string | null
          observacoes: string | null
          pessoa_destino_id: string
          pessoa_origem_id: string
          subtipo_relacionamento: string | null
          tipo_relacionamento: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          data_casamento?: string | null
          data_separacao?: string | null
          id?: string
          local_casamento?: string | null
          local_separacao?: string | null
          observacoes?: string | null
          pessoa_destino_id: string
          pessoa_origem_id: string
          subtipo_relacionamento?: string | null
          tipo_relacionamento: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          data_casamento?: string | null
          data_separacao?: string | null
          id?: string
          local_casamento?: string | null
          local_separacao?: string | null
          observacoes?: string | null
          pessoa_destino_id?: string
          pessoa_origem_id?: string
          subtipo_relacionamento?: string | null
          tipo_relacionamento?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relacionamentos_pessoa_destino_id_fkey"
            columns: ["pessoa_destino_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relacionamentos_pessoa_destino_id_fkey"
            columns: ["pessoa_destino_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relacionamentos_pessoa_origem_id_fkey"
            columns: ["pessoa_origem_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relacionamentos_pessoa_origem_id_fkey"
            columns: ["pessoa_origem_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_change_requests: {
        Row: {
          action: string
          admin_note: string | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          created_at: string
          id: string
          payload: Json
          related_pessoa_id: string | null
          relationship_id: string | null
          relationship_subtype: string | null
          relationship_type: string
          requester_pessoa_id: string
          requester_user_id: string
          status: string
          target_pessoa_id: string | null
          updated_at: string
        }
        Insert: {
          action: string
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          created_at?: string
          id?: string
          payload?: Json
          related_pessoa_id?: string | null
          relationship_id?: string | null
          relationship_subtype?: string | null
          relationship_type: string
          requester_pessoa_id: string
          requester_user_id: string
          status?: string
          target_pessoa_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          created_at?: string
          id?: string
          payload?: Json
          related_pessoa_id?: string | null
          relationship_id?: string | null
          relationship_subtype?: string | null
          relationship_type?: string
          requester_pessoa_id?: string
          requester_user_id?: string
          status?: string
          target_pessoa_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_change_requests_related_pessoa_id_fkey"
            columns: ["related_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_change_requests_related_pessoa_id_fkey"
            columns: ["related_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_change_requests_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relacionamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_change_requests_requester_pessoa_id_fkey"
            columns: ["requester_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_change_requests_requester_pessoa_id_fkey"
            columns: ["requester_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_change_requests_target_pessoa_id_fkey"
            columns: ["target_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_change_requests_target_pessoa_id_fkey"
            columns: ["target_pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visual_settings: {
        Row: {
          created_at: string
          draft_payload: Json | null
          entrance_confirmation_description: string
          entrance_confirmation_title: string
          entrance_create_account_cta_label: string
          entrance_description: string
          entrance_eyebrow: string
          entrance_first_access_cta_label: string
          entrance_first_access_description: string
          entrance_first_access_title: string
          entrance_footer_note: string | null
          entrance_forgot_password_label: string
          entrance_login_cta_label: string
          entrance_login_description: string
          entrance_login_title: string
          entrance_title: string
          global_accent_color: string
          global_button_radius: string
          global_card_background_color: string
          global_card_radius: string
          global_identity_name: string
          global_identity_short_name: string
          global_identity_tagline: string
          global_muted_text_color: string
          global_primary_color: string
          global_text_color: string
          home_background_color: string
          home_background_media_opacity: number
          home_background_media_url: string | null
          home_logo_alt_text: string
          home_logo_media_url: string | null
          id: boolean
          last_published_at: string | null
          last_published_by: string | null
          public_privacy_label: string
          public_privacy_url: string
          public_support_label: string | null
          public_support_url: string | null
          public_terms_label: string
          public_terms_url: string
          publication_status: string
          scheduled_publish_at: string | null
          seo_description: string
          seo_title: string
          social_share_image_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          draft_payload?: Json | null
          entrance_confirmation_description?: string
          entrance_confirmation_title?: string
          entrance_create_account_cta_label?: string
          entrance_description?: string
          entrance_eyebrow?: string
          entrance_first_access_cta_label?: string
          entrance_first_access_description?: string
          entrance_first_access_title?: string
          entrance_footer_note?: string | null
          entrance_forgot_password_label?: string
          entrance_login_cta_label?: string
          entrance_login_description?: string
          entrance_login_title?: string
          entrance_title?: string
          global_accent_color?: string
          global_button_radius?: string
          global_card_background_color?: string
          global_card_radius?: string
          global_identity_name?: string
          global_identity_short_name?: string
          global_identity_tagline?: string
          global_muted_text_color?: string
          global_primary_color?: string
          global_text_color?: string
          home_background_color?: string
          home_background_media_opacity?: number
          home_background_media_url?: string | null
          home_logo_alt_text?: string
          home_logo_media_url?: string | null
          id?: boolean
          last_published_at?: string | null
          last_published_by?: string | null
          public_privacy_label?: string
          public_privacy_url?: string
          public_support_label?: string | null
          public_support_url?: string | null
          public_terms_label?: string
          public_terms_url?: string
          publication_status?: string
          scheduled_publish_at?: string | null
          seo_description?: string
          seo_title?: string
          social_share_image_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          draft_payload?: Json | null
          entrance_confirmation_description?: string
          entrance_confirmation_title?: string
          entrance_create_account_cta_label?: string
          entrance_description?: string
          entrance_eyebrow?: string
          entrance_first_access_cta_label?: string
          entrance_first_access_description?: string
          entrance_first_access_title?: string
          entrance_footer_note?: string | null
          entrance_forgot_password_label?: string
          entrance_login_cta_label?: string
          entrance_login_description?: string
          entrance_login_title?: string
          entrance_title?: string
          global_accent_color?: string
          global_button_radius?: string
          global_card_background_color?: string
          global_card_radius?: string
          global_identity_name?: string
          global_identity_short_name?: string
          global_identity_tagline?: string
          global_muted_text_color?: string
          global_primary_color?: string
          global_text_color?: string
          home_background_color?: string
          home_background_media_opacity?: number
          home_background_media_url?: string | null
          home_logo_alt_text?: string
          home_logo_media_url?: string | null
          id?: boolean
          last_published_at?: string | null
          last_published_by?: string | null
          public_privacy_label?: string
          public_privacy_url?: string
          public_support_label?: string | null
          public_support_url?: string | null
          public_terms_label?: string
          public_terms_url?: string
          publication_status?: string
          scheduled_publish_at?: string | null
          seo_description?: string
          seo_title?: string
          social_share_image_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_visual_settings_audit: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          id: string
          next_payload: Json | null
          note: string | null
          previous_payload: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          id?: string
          next_payload?: Json | null
          note?: string | null
          previous_payload?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          id?: string
          next_payload?: Json | null
          note?: string | null
          previous_payload?: Json | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          conteudo_id: string | null
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          href: string | null
          id: string
          label: string
          metadata: Json
          tipo_conteudo: string | null
          titulo: string | null
          user_id: string
        }
        Insert: {
          conteudo_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          href?: string | null
          id?: string
          label: string
          metadata?: Json
          tipo_conteudo?: string | null
          titulo?: string | null
          user_id: string
        }
        Update: {
          conteudo_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          href?: string | null
          id?: string
          label?: string
          metadata?: Json
          tipo_conteudo?: string | null
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_first_map_accesses: {
        Row: {
          first_accessed_at: string
          metadata: Json
          pessoa_id: string | null
          updated_at: string
          user_id: string
          welcome_notification_id: string | null
        }
        Insert: {
          first_accessed_at?: string
          metadata?: Json
          pessoa_id?: string | null
          updated_at?: string
          user_id: string
          welcome_notification_id?: string | null
        }
        Update: {
          first_accessed_at?: string
          metadata?: Json
          pessoa_id?: string | null
          updated_at?: string
          user_id?: string
          welcome_notification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_first_map_accesses_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_first_map_accesses_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_first_map_accesses_welcome_notification_id_fkey"
            columns: ["welcome_notification_id"]
            isOneToOne: false
            referencedRelation: "notificacoes_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      user_person_links: {
        Row: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_edit?: boolean
          created_at?: string | null
          created_by?: string | null
          dados_confirmados?: boolean
          dados_confirmados_em?: string | null
          id?: string
          managed_by_admin?: boolean
          permission_role?: string | null
          pessoa_id: string
          principal?: boolean
          relacao_com_perfil?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_edit?: boolean
          created_at?: string | null
          created_by?: string | null
          dados_confirmados?: boolean
          dados_confirmados_em?: string | null
          id?: string
          managed_by_admin?: boolean
          permission_role?: string | null
          pessoa_id?: string
          principal?: boolean
          relacao_com_perfil?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_person_links_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_links_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas_com_estatisticas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      google_calendar_connection_status: {
        Row: {
          ativo: boolean | null
          connected_at: string | null
          google_account_email: string | null
          google_calendar_id: string | null
          id: string | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          connected_at?: string | null
          google_account_email?: string | null
          google_calendar_id?: string | null
          id?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          connected_at?: string | null
          google_account_email?: string | null
          google_calendar_id?: string | null
          id?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pessoas_com_estatisticas: {
        Row: {
          cor_bg_card: string | null
          created_at: string | null
          curiosidades: string | null
          data_falecimento: string | null
          data_nascimento: string | null
          endereco: string | null
          foto_principal_url: string | null
          humano_ou_pet: string | null
          id: string | null
          local_atual: string | null
          local_falecimento: string | null
          local_nascimento: string | null
          minibio: string | null
          nome_completo: string | null
          rede_social: string | null
          telefone: string | null
          total_arquivos: number | null
          total_conjuges: number | null
          total_filhos: number | null
          total_pais: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_create_user_person_link: {
        Args: {
          target_can_edit?: boolean
          target_pessoa_id: string
          target_principal?: boolean
          target_relacao_com_perfil?: string
          target_user_id: string
        }
        Returns: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_person_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_delete_user_person_link: {
        Args: { target_link_id: string }
        Returns: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_person_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_profile_control_requests: {
        Args: never
        Returns: {
          admin_note: string
          created_at: string
          description: string
          id: string
          reason: string
          requester_email: string
          requester_label: string
          requester_pessoa_id: string
          requester_user_id: string
          reviewed_at: string
          reviewed_by: string
          status: string
          target_label: string
          target_pessoa_id: string
          updated_at: string
        }[]
      }
      admin_list_profiles_for_linking: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          id: string
          nome_exibicao: string
          role: string
        }[]
      }
      admin_reset_person_profile: {
        Args: { target_pessoa_id: string }
        Returns: Json
      }
      admin_review_profile_control_request: {
        Args: {
          next_status: string
          permission_role?: string
          request_id: string
          review_note?: string
        }
        Returns: {
          admin_note: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          requester_pessoa_id: string | null
          requester_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_pessoa_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profile_control_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_user_person_link: {
        Args: {
          target_can_edit?: boolean
          target_link_id: string
          target_principal?: boolean
          target_relacao_com_perfil?: string
        }
        Returns: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_person_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      clear_parentescos_calculados: { Args: never; Returns: undefined }
      confirm_own_user_person_link_data: {
        Args: { target_link_id: string }
        Returns: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_person_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_internal_notification_for_user: {
        Args: {
          notification_link?: string
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type?: string
          target_user_id: string
        }
        Returns: string
      }
      create_profile_control_request: {
        Args: {
          request_description?: string
          request_reason?: string
          target_pessoa_id: string
        }
        Returns: {
          admin_note: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          requester_pessoa_id: string | null
          requester_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_pessoa_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profile_control_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_has_person_link: { Args: never; Returns: boolean }
      ensure_first_access_person_link: {
        Args: { target_pessoa_id: string }
        Returns: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_person_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      forum_increment_topic_view: {
        Args: { topic_id: string }
        Returns: undefined
      }
      forum_is_admin: { Args: never; Returns: boolean }
      forum_mark_solution: {
        Args: { target_resposta_id: string; target_topico_id: string }
        Returns: undefined
      }
      get_person_profile_selected_badges: {
        Args: { target_pessoa_id: string }
        Returns: Json
      }
      get_site_visual_settings_audit_changes: {
        Args: { audit_record_id: string }
        Returns: {
          field_key: string
          field_label: string
          next_value: string
          previous_value: string
        }[]
      }
      insert_notification_dispatch_log_for_user: {
        Args: {
          dispatch_error_message?: string
          dispatch_metadata?: Json
          dispatch_provider?: string
          dispatch_status: string
          notification_channel: string
          notification_type: string
          target_notification_id: string
          target_user_id: string
        }
        Returns: undefined
      }
      is_admin_user: { Args: { target_user_id?: string }; Returns: boolean }
      list_admin_user_ids: { Args: never; Returns: string[] }
      list_profile_managers: {
        Args: { target_pessoa_id: string }
        Returns: {
          avatar_url: string
          can_edit: boolean
          nome_exibicao: string
          permission_role: string
          principal: boolean
          user_id: string
        }[]
      }
      publish_due_site_visual_settings: {
        Args: never
        Returns: {
          message: string
          published: boolean
          published_at: string
        }[]
      }
      set_user_primary_person_link: {
        Args: { target_pessoa_id: string; target_user_id: string }
        Returns: {
          can_edit: boolean
          created_at: string | null
          created_by: string | null
          dados_confirmados: boolean
          dados_confirmados_em: string | null
          id: string
          managed_by_admin: boolean
          permission_role: string | null
          pessoa_id: string
          principal: boolean
          relacao_com_perfil: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_person_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      validate_first_access_code: {
        Args: { access_code: string }
        Returns: {
          already_used: boolean
          data_nascimento: string
          local_nascimento: string
          nome_completo: string
          pessoa_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
