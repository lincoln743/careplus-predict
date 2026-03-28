#!/bin/bash
PROJECT_DIR="/home/lincoln-pereira/Downloads/CarePlusPredictExpo"

echo "🔍 Procurando e substituindo ícones inválidos e caracteres ocultos..."
echo "-------------------------------------------------------------"

# 1️⃣ Substitui ícones Ionicons inválidos
find "$PROJECT_DIR/src" -type f -name "*.js" -exec sed -i 's/target-outline/heart-outline/g' {} \;

# 2️⃣ Remove caracteres invisíveis (❓, �, \u2753, \uFFFD e similares)
find "$PROJECT_DIR/src" -type f -name "*.js" -exec sed -i "s/�//g" {} \;
find "$PROJECT_DIR/src" -type f -name "*.js" -exec sed -i "s/❓//g" {} \;
find "$PROJECT_DIR/src" -type f -name "*.js" -exec sed -i 's/\\u2753//g' {} \;
find "$PROJECT_DIR/src" -type f -name "*.js" -exec sed -i 's/\\uFFFD//g' {} \;

# 3️⃣ Verifica se sobrou algum ícone inválido
echo "🔎 Verificando ícones ainda inválidos..."
grep -R "target-outline" "$PROJECT_DIR/src" || echo "✅ Nenhum ícone inválido restante."

# 4️⃣ Confirma substituições aplicadas
echo "-------------------------------------------------------------"
echo "✅ Correção concluída."
echo "💡 Agora execute:"
echo "   rm -rf .expo && npx expo start -c"
