# 05 · Entorno del desarrollador

> Verificación hecha el 2026-07-14 en la máquina del usuario (macOS 26.5, Apple Silicon / arm64).
> Útil para saber qué falta antes de empezar a construir Savia.

## Presente ✅

| Herramienta | Versión |
|---|---|
| macOS | 26.5 (arm64) |
| Node | v24.1.0 |
| npm / npx | 11.3.0 |
| Git | 2.50.1 |
| Docker | 28.4.0 (útil para Postgres local) |
| Homebrew | 6.0.10 |
| Swift (Command Line Tools) | 6.3.2 |

## Falta ❌ / por instalar

| Falta | Impacto para Savia | Cómo resolver |
|---|---|---|
| **pnpm** (global) | El monorepo usará pnpm workspaces | `corepack enable` (viene con Node) |
| **watchman** | Recomendado para Metro (React Native) | `brew install watchman` |
| **Xcode completo** | Simulador iOS (solo hay Command Line Tools) | App Store, **o** Expo Go + EAS Build en la nube |
| **Android Studio / SDK / Java** | Emulador Android; no hay `ANDROID_HOME` ni Java | Instalar Android Studio, **o** Expo Go + EAS |
| **CocoaPods** | Solo para builds nativos iOS | `brew install cocoapods` (Expo gestionado no lo necesita) |
| **psql** | Cliente CLI de Postgres (opcional, BD gestionada) | `brew install libpq` |

## Lectura corta

Para **empezar** Savia con Expo, lo esencial (Node + pnpm + Expo vía `npx`) está o se resuelve
en 1 comando (`corepack enable`). Los toolchains nativos (Xcode/Android/CocoaPods/watchman)
**se pueden posponer** usando **Expo Go + EAS Build** en la nube — que es justo por lo que se
eligió Expo. Se instalan solo cuando se necesiten builds nativos locales.

## Nota sobre versiones de Node

Node **24 es LTS** y sirve. Ojo: el backend del proyecto vecino Equitrack exige `>=24.13.1`
y la máquina tiene `24.1.0`; para Savia con Expo/Prisma la 24.1.0 funciona, pero conviene
mantener Node en una LTS reciente (24.x o 22.x) con nvm/fnm.

## ⚠️ Recordatorio de carpetas

Savia va en `/Users/lejoarroyave/Projects/Savia/`. El proyecto **Equitrack** (equino, otro
stack) vive en `/Users/lejoarroyave/Archie/Equitrack/`. No mezclar.
