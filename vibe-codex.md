Crie um site para gerenciar desafios de corrida conforme especificação abaixo.

#  Principal
- Deve permitir cadastrar desafios e equipes participantes
- Os desafios devem ser de 2 tipos: pace (ritmo) *medio* ou tempo *acumulado*
- Cada equipe participante do desafio tera diversos corredores cadastrados. A administração deve permitir lançar o resultado individual do corredor de acordo com o desafio.
- Vencce a equpe com menor pace medio ou menor tempo acumulado de acordo com desafio.
- Todos os dados devem ser salvos em um banco de dados.
- Site deve ser publico permitindo visualização e pedir autenticação para qualquer cadastro de dados. 

# Arquitetura
- Website em react hospedado na Vercell
- Banco de dados neon-db/postgress
- Sugira a melhor formma de autenticação do site.
- visualização otimizada para dispositivo movel

# Tela principal
- lista desafios ativos e botao para criar um novo desafio.
- na lista informar qual a equipe esta vencendo baseado em resultados parciais.

# Tela detalhes dos desafios
- Mostra a descrição e tip do desafio
- Apresenta os resultados parciais de cada equipe
- permite incluir nova equipe ou selecionar uma para abrir e lançar resultados.
- apuração de resultados parciais deve considerar todos os membros da equipe. Para o pace médio so utilizar o resultado de participantes que tem pace diferente de zero

# Tela de equipe
- Permite incluir participantes e seus resultados individuais.
- Resultado individual deve ser opcional. Se nao preenchido, considerar 0.
- Tempos e paces devem ser registrados no banco em segundos.
- Na tela de cadastro formatar para 3 campos: horas, minutos e segundos.
- Unidade do pace é minutos/kilometro

