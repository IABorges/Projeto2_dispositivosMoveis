ReflexMaster é um aplicativo interativo desenvolvido com a finalidade de mensurar a agilidade e os reflexos motores dos usuários por meio de uma interface simples e responsiva. O projeto foi implementado utilizando o framework React Native, com suporte do ambiente Expo, e emprega conceitos de programação assíncrona, manipulação de estado e integração com serviços em nuvem.

A aplicação apresenta um jogo de curta duração (30 segundos), no qual o usuário deve reagir rapidamente ao surgimento de um botão em posições aleatórias na tela.![image](https://github.com/user-attachments/assets/e0e012da-aedc-4172-861f-e103cf25b2b9) Cada resposta correta, dentro do tempo limite, resulta em uma pontuação proporcional à velocidade de reação. Ao final da rodada, o jogador tem a opção de inserir seu nome e registrar sua pontuação em um sistema de ranking.![image](https://github.com/user-attachments/assets/c74cd18c-7905-401b-90b5-761652c776a0)

Para armazenamento persistente das pontuações, foi utilizada a plataforma Firebase Realtime Database, permitindo leitura e gravação de dados em tempo real.![image](https://github.com/user-attachments/assets/c582d7c5-d2b1-4cfc-8820-32f876cab042)
 A comunicação com o banco de dados é realizada por meio das funções push e get, importadas da biblioteca firebase/database, garantindo a sincronização dos dados e atualização dinâmica do ranking com os dez melhores resultados.![image](https://github.com/user-attachments/assets/6b081de0-dc19-4328-92be-59f214e786b1)


No aspecto visual, a interface foi construída com o uso de componentes do react-native, contando com o pacote expo-linear-gradient para aplicação de fundos gradientes e expo-av para gerenciamento de efeitos sonoros. O design prioriza uma experiência intuitiva, responsiva e com apelo visual, adequada ao contexto lúdico da aplicação.![image](https://github.com/user-attachments/assets/142d51ed-b16b-4c5f-9470-d9479c5de800)


O projeto visa, além do entretenimento, demonstrar habilidades em desenvolvimento de aplicações móveis com armazenamento remoto, manipulação de estados em tempo real, estilização customizada e uso de bibliotecas multimídia.
