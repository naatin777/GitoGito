# Redux Toolkit リファクタリングプラン

## 現在の構造（問題点）

```
src/
├── store/                           # ❌ 古いRedux構成（機能横断的）
│   ├── hooks.ts
│   ├── index.ts
│   └── slices/                      # ❌ すべてのsliceを1箇所に集約
│       ├── bodySlice.ts             # edit-commit-message関連
│       ├── commitSlice.ts           # commit機能関連
│       ├── editCommitMessageSlice.ts
│       ├── editCommitMessageTypes.ts
│       ├── footerSlice.ts
│       ├── formSlice.ts
│       ├── headerSlice.ts
│       └── issueSlice.ts            # issue機能関連
├── features/                        # UI・ロジックのみ（状態管理なし）
│   ├── commit/
│   │   ├── ui.tsx
│   │   ├── hook.ts
│   │   └── domain/
│   ├── issue/
│   │   ├── ui.tsx
│   │   ├── hook.ts
│   │   └── domain/
│   ├── help/
│   └── version/
└── screens/                         # ❌ viewsの方が適切
    └── edit-commit-message/
```

## 新しい構造（2026年ベストプラクティス）

```
src/
├── app/                             # ✅ アプリ全体の基盤のみ
│   ├── store.ts                     # Store設定（全reducerの統合）
│   └── hooks.ts                     # 型付きuseDispatch/useSelector
│
├── features/                        # ✅ 機能単位で垂直分割（Feature-based）
│   ├── commit/                      # コミットメッセージ生成機能
│   │   ├── commitSlice.ts           # State + Reducer + Thunk + Selector
│   │   ├── ui.tsx                   # UI コンポーネント
│   │   ├── hook.ts                  # カスタムフック
│   │   └── domain/                  # ビジネスロジック
│   │
│   ├── issue/                       # Issue生成機能
│   │   ├── issueSlice.ts            # State + Reducer + Thunk + Selector
│   │   ├── ui.tsx
│   │   ├── hook.ts
│   │   └── domain/
│   │
│   ├── edit-commit-message/         # ✅ 新規作成（screens/から移行）
│   │   ├── editCommitMessageSlice.ts # メインslice
│   │   ├── headerSlice.ts           # Header部分のslice
│   │   ├── bodySlice.ts             # Body部分のslice
│   │   ├── footerSlice.ts           # Footer部分のslice
│   │   ├── formSlice.ts             # Form状態のslice
│   │   ├── types.ts                 # 型定義
│   │   └── components/              # 画面コンポーネント
│   │       ├── EditCommitMessage.tsx
│   │       ├── Contents.tsx
│   │       ├── Header.tsx
│   │       ├── Body.tsx
│   │       ├── Hooter.tsx
│   │       ├── Line.tsx
│   │       ├── DecoratedText.tsx
│   │       └── StatusBar.tsx
│   │
│   ├── help/                        # ヘルプ画面（状態なし）
│   │   └── ui.tsx
│   │
│   └── version/                     # バージョン表示（状態なし）
│       └── ui.tsx
│
├── views/                           # ✅ CLIの画面管理（旧screens/）
│   └── （現在は不要、edit-commit-messageをfeaturesに統合）
│
└── components/                      # 共通UIコンポーネント
    ├── AgentLoop.tsx
    ├── Carousel.tsx
    ├── Select.tsx
    ├── Selection.tsx
    ├── SetupFlow.tsx
    ├── Spinner.tsx
    └── TextInput.tsx
```

## 移行ステップ

### Step 1: app/ フォルダの作成

- [ ] `src/app/` ディレクトリを作成
- [ ] `src/store/index.ts` → `src/app/store.ts` に移動・リネーム
- [ ] `src/store/hooks.ts` → `src/app/hooks.ts` に移動

### Step 2: commit機能のslice移行

- [ ] `src/store/slices/commitSlice.ts` → `src/features/commit/commitSlice.ts`

### Step 3: issue機能のslice移行

- [ ] `src/store/slices/issueSlice.ts` → `src/features/issue/issueSlice.ts`

### Step 4: edit-commit-message機能の統合

- [ ] `src/features/edit-commit-message/` ディレクトリを作成
- [ ] 以下のsliceを移動：
  - `src/store/slices/editCommitMessageSlice.ts` →
    `src/features/edit-commit-message/editCommitMessageSlice.ts`
  - `src/store/slices/headerSlice.ts` →
    `src/features/edit-commit-message/headerSlice.ts`
  - `src/store/slices/bodySlice.ts` →
    `src/features/edit-commit-message/bodySlice.ts`
  - `src/store/slices/footerSlice.ts` →
    `src/features/edit-commit-message/footerSlice.ts`
  - `src/store/slices/formSlice.ts` →
    `src/features/edit-commit-message/formSlice.ts`
  - `src/store/slices/editCommitMessageTypes.ts` →
    `src/features/edit-commit-message/types.ts`
- [ ] `src/screens/edit-commit-message/` →
      `src/features/edit-commit-message/components/` に移動

### Step 5: 空フォルダの削除

- [ ] `src/store/slices/` を削除
- [ ] `src/store/` を削除
- [ ] `src/screens/` を削除

### Step 6: インポート文の更新

- [ ] すべてのファイルで `from "../../store/"` を `from "../../app/"` に更新
- [ ] slice参照を各featureのパスに更新

### Step 7: 検証

- [ ] `deno check src/main.ts` で型チェック
- [ ] テストを実行して問題がないか確認

## 主なメリット

1. **機能の独立性向上**:
   各機能のsliceがその機能フォルダ内に配置され、関連コードがまとまる
2. **保守性向上**: 機能追加・削除時に該当フォルダのみを操作すればよい
3. **スケーラビリティ**: 新機能追加時に他の機能に影響を与えない
4. **2026年ベストプラクティス準拠**: Redux Toolkit公式の推奨構成に従っている
5. **理解しやすい**: 「この機能の状態管理はどこ？」が一目で分かる

## 参考リンク

- [Redux Style Guide - Feature Folders](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/introduction/getting-started)
