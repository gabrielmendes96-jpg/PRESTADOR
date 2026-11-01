// Serviços do dia a dia, bem específicos, somados ao catálogo base (catalogo-servicos.mjs).
// Foco: o que as pessoas realmente digitam ("troca de resistência", "tomada queimada", "rádio de carro").
export default {
  eletricista: [
    'Troca de resistência de chuveiro', 'Troca de resistência de torneira elétrica', 'Chuveiro queimado ou sem esquentar',
    'Tomada queimada ou derretida', 'Cheiro de queimado na tomada ou fiação', 'Disjuntor desarmando toda hora', 'Troca de disjuntor',
    'Troca de interruptor', 'Instalação de luminária de teto', 'Instalação de lustre', 'Instalação de sensor de presença',
    'Instalação de fotocélula', 'Instalação de DR e DPS', 'Passagem de fiação nova', 'Tomada para forno elétrico ou cooktop',
    'Instalação de ponto de TV e antena', 'Falta de luz em parte da casa', 'Choque ao encostar em geladeira ou máquina de lavar',
    'Aterramento de geladeira e máquina de lavar', 'Instalação de tomada 220V', 'Troca de fiação antiga', 'Instalação de refletor e LED externo',
    'Instalação de ar-condicionado (parte elétrica)', 'Troca de lâmpada em local alto',
  ],
  aquecedor: [
    'Troca de resistência de boiler', 'Troca de resistência de aquecedor elétrico', 'Chuveiro sem água quente', 'Aquecedor a gás não acende',
    'Troca de termostato do boiler',
  ],
  encanador: [
    'Vazamento na pia ou torneira', 'Troca de reparo da torneira', 'Troca de boia da caixa d\'água', 'Troca de válvula de descarga',
    'Troca de mangueira da máquina de lavar', 'Instalação de máquina de lavar louça', 'Instalação de bebedouro', 'Instalação de ducha higiênica',
    'Troca de vaso sanitário', 'Cano estourado', 'Falta de pressão na água', 'Instalação de pressurizador', 'Limpeza de ralo e sifão',
    'Instalação de chuveiro a gás', 'Troca de caixa acoplada', 'Torneira pingando', 'Instalação de tanque de lavanderia',
    'Vaso sanitário entupido', 'Conserto de registro que não fecha', 'Instalação de torneira de cozinha gourmet',
  ],
  vazamento: [
    'Vazamento embaixo da pia', 'Vazamento no teto do banheiro', 'Mancha de umidade na parede', 'Conta de água alta (vazamento escondido)',
    'Vazamento no vaso sanitário', 'Vazamento no chuveiro ou box',
  ],
  desentupidor: [
    'Pia da cozinha entupida', 'Vaso sanitário entupido', 'Ralo do banheiro entupido', 'Esgoto voltando no ralo', 'Caixa de gordura entupida',
    'Tanque de lavanderia entupido',
  ],
  mecanico: [
    'Instalação de rádio e multimídia', 'Troca de rádio de carro', 'Instalação de som automotivo', 'Instalação de insulfilm', 'Instalação de alarme automotivo',
    'Instalação de trava elétrica', 'Instalação de vidros elétricos', 'Instalação de engate de reboque', 'Instalação de sensor de ré', 'Instalação de câmera de ré',
    'Troca de lâmpadas e faróis', 'Instalação de LED e xênon', 'Instalação de rastreador', 'Troca de pastilha de freio',
    'Carro não pega', 'Barulho na suspensão', 'Troca de pneus e balanceamento', 'Revisão para viagem', 'Luz de injeção acesa',
  ],
  instalador_acessorios_auto: [
    'Instalação de rádio e multimídia', 'Troca de rádio de carro', 'Instalação de insulfilm', 
    'Instalação de lâmpadas LED', 'Instalação de GPS e rastreador', 'Instalação de moldura de rádio',
  ],
  som_auto: [
    'Troca de rádio de carro', 'Instalação de rádio e multimídia', 'Instalação de alto-falantes nas portas', 'Som do carro chiando ou falhando', 'Instalação de antena de rádio',
  ],
  eletrica_auto: [
    'Carro não liga (bateria ou partida)', 'Pane elétrica', 'Troca de lâmpadas e faróis', 'Instalação de rádio e acessórios', 'Vidro elétrico que não sobe',
    'Alarme disparando sozinho', 'Luzes do painel acesas',
  ],
  pintor: [
    'Pintura de quarto', 'Pintura de sala', 'Pintura de cozinha', 'Retoque de pintura', 'Pintura de apartamento para entregar', 'Pintura de teto com mofo',
    'Pintura de parede com infiltração', 'Pintura de portão', 'Pintura de muro', 'Pintura de móveis de madeira',
  ],
  pedreiro: [
    'Conserto de infiltração e umidade', 'Quebrar parede', 'Fechar parede ou vão', 'Assentar vaso sanitário e pia', 'Troca de piso quebrado', 'Reparo de rachadura na parede',
    'Construção de edícula ou quarto nos fundos', 'Reboco de parede interna', 'Troca de azulejo quebrado', 'Instalação de ralo e caimento',
  ],
  chaveiro: [
    'Perdi a chave de casa', 'Chave quebrada na fechadura', 'Fechadura emperrada', 'Abertura de carro trancado', 'Cópia de chave de carro', 'Troca de segredo após perder a chave',
    'Instalação de fechadura de embutir', 'Troca de miolo da fechadura',
  ],
  marceneiro: [
    'Montagem de guarda-roupa', 'Montagem de cozinha', 'Conserto de porta de armário', 'Troca de dobradiça', 'Montagem de cama e beliche', 'Conserto de gaveta emperrada',
    'Montagem de móveis comprados online', 'Prateleira sob medida', 'Reparo de porta de madeira empenada',
  ],
  diarista: [
    'Faxina semanal', 'Faxina quinzenal', 'Limpeza antes de mudança', 'Limpeza depois de mudança', 'Organização de armários e despensa', 'Limpeza de geladeira e fogão',
  ],
  tecnico_informatica: [
    'Computador lento', 'Notebook não liga', 'Formatação com backup', 'Instalação de impressora e Wi-Fi', 'Recuperação de arquivos apagados',
    'Troca de HD por SSD', 'Montagem de computador gamer',
  ],
  ar_condicionado: [
    'Ar-condicionado pingando água', 'Ar-condicionado não gela', 'Limpeza e higienização de ar-condicionado', 'Instalação de split 9000 a 12000 BTUs', 'Barulho no ar-condicionado',
    'Troca de capacitor', 'Recarga de gás',
  ],
  telhador: [
    'Goteira no telhado', 'Telha quebrada', 'Calha entupida ou vazando', 'Troca de rufo', 'Limpeza de telhado e calhas',
  ],
  vidraceiro: [
    'Troca de vidro quebrado', 'Box de banheiro novo', 'Espelho sob medida', 'Vidro de janela trincado', 'Porta de vidro de correr',
  ],
  serralheiro: [
    'Portão enroscando ou arrastando', 'Solda de portão', 'Grade de janela sob medida', 'Corrimão de escada', 'Conserto de fechadura de portão',
  ],
  portao_eletrico: [
    'Portão eletrônico parou de funcionar', 'Troca de controle remoto do portão', 'Portão fazendo barulho', 'Troca de motor de portão', 'Regulagem de fim de curso',
  ],
  cameras: [
    'Câmera sem imagem', 'Ver câmeras pelo celular', 'Instalação de câmera externa', 'Troca de gravador (DVR)',
  ],
  jardineiro: [
    'Poda de árvore pequena', 'Limpeza de quintal', 'Plantio de grama', 'Adubação de jardim',
  ],
  dedetizador: [
    'Baratas na cozinha', 'Formigas dentro de casa', 'Cupim em móveis e portas', 'Ratos no telhado', 'Pulgas e carrapatos em casa',
  ],
  faxineira: [
    'Faxina completa de casa', 'Faxina pós-obra', 'Limpeza de vidros e janelas', 'Limpeza de apartamento pequeno',
  ],
  mudanca: [
    'Mudança de apartamento', 'Mudança de casa', 'Carreto de poucos móveis', 'Mudança com montagem de móveis',
  ],
}
