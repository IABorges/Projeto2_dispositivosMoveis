  import React, { useState, useEffect, useRef } from 'react';
  import { Audio } from 'expo-av';
  //importanto os sons
  import somMP3 from './assets/button-3.mp3';
  import somWav from './assets/goodresult.mp3';
  //conexão com o banco de dados
  import { database } from './firebaseconfig';
  import { ref, push, query, limitToLast, orderByChild, get } from 'firebase/database';
  // import para o gradiete fofo
  import { LinearGradient } from 'expo-linear-gradient';
  import { useFonts } from 'expo-font';


  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Vibration,
    TextInput,
    FlatList,
  } from 'react-native';

  const { width, height } = Dimensions.get('window');

  export default function App() {
  
    const [tela, setTela] = useState('menu');
    const [pontuacao, setPontuacao] = useState(0);
    const [tempoRestante, setTempoRestante] = useState(30);
    const [posicaoBotao, setPosicaoBotao] = useState({ top: 100, left: 100 });
    const [botaoVisivel, setBotaoVisivel] = useState(false);
    const [inicioClique, setInicioClique] = useState(null);
    const [nomeJogador, setNomeJogador] = useState('');
    const [ranking, setRanking] = useState([]);
    const temporizadorJogo = useRef(null);
    const temporizadorBotao = useRef(null);
    const somClique = useRef(null);
    const somFim = useRef(null);
    const [somCarregado, setSomCarregado] = useState(false);
    const [somFimCarregado, setSomFimCarregado] = useState(false);
    const [fontsLoaded] = useFonts({'Oi-Regular': require('./assets/Oi-Regular.ttf'),});

    useEffect(() => {
    console.log( database ? 'Conexao feita' : 'conexao falha');
    }, []);

    useEffect(() => {
      const carregarSons = async () => {
        try {
          const { sound: click } = await Audio.Sound.createAsync(somMP3);
          somClique.current = click;
          setSomCarregado(true);

          const { sound: fim } = await Audio.Sound.createAsync(somWav);
          somFim.current = fim;
          setSomFimCarregado(true);
        } catch (e) {
          console.log(e);
        }
      };

      carregarSons();

      return () => {
        somClique.current?.unloadAsync();
        somFim.current?.unloadAsync();
      };
    }, []);

    const salvarNoRanking = async () => {
      const entrada = { nome: nomeJogador || 'Anônimo', pontuacao };
      try {
        await push(ref(database, 'ranking/'), entrada);
        setNomeJogador('');
        setTela('menu');
      } catch (e) {
        console.log('erro ao salvar no Firebase:', e);
      }
    };

 useEffect(() => {
  const carregarRanking = async () => {
    try {
      const rankingRef = ref(database, 'ranking/');
      const snapshot = await get(rankingRef);

      if (snapshot.exists()) {
        const dados = Object.values(snapshot.val());
        const top10 = dados.sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 10);
        setRanking(top10);
      } else {
        setRanking([]); // limpa se não houver nada
        console.log('Nenhum dado encontrado');
      }
    } catch (e) {
      console.log('Erro ao carregar ranking:', e);
    }
  };

  if (tela === 'ranking') {
    carregarRanking(); 
  }
  }, [tela]); 

    const iniciarJogo = () => {
      setPontuacao(0);
      setTempoRestante(30);
      setTela('jogo');
      mostrarNovoBotao();
      setInicioClique(Date.now());

      temporizadorJogo.current = setInterval(() => {
        setTempoRestante((anterior) => {
          if (anterior <= 1) {
            clearInterval(temporizadorJogo.current);
            clearTimeout(temporizadorBotao.current);
            setBotaoVisivel(false);
            Vibration.vibrate(500);
            if (somFimCarregado && somFim.current) {
              somFim.current.replayAsync().catch(() => {});
            }
            setTimeout(() => setTela('resultado'), 500);
            return 0;
          }
          return anterior - 1;
        });
      }, 1000);
    };

    const aoClicarBotao = async () => {
      const tempoReacao = Date.now() - inicioClique;
      const pontos = Math.max(0, Math.floor(1000 - tempoReacao));
      setPontuacao((anterior) => anterior + pontos);
      Vibration.vibrate(100);
      if (somCarregado && somClique.current) {
        await somClique.current.replayAsync().catch(() => {});
      }
      setBotaoVisivel(false);
      clearTimeout(temporizadorBotao.current);
      mostrarNovoBotao();
    };

    const mostrarNovoBotao = () => {
      const top = Math.random() * (height - 200);
      const left = Math.random() * (width - 150);
      setPosicaoBotao({ top, left });
      setBotaoVisivel(true);
      setInicioClique(Date.now());

      temporizadorBotao.current = setTimeout(() => {
        setBotaoVisivel(false);
        mostrarNovoBotao();
      }, 2000);
    };

    const BotaoMenu = ({ titulo, onPress }) => (
      <TouchableOpacity style={estilos.botaoMenu} onPress={onPress}>
        <Text style={estilos.textoBotao}>{titulo}</Text>
      </TouchableOpacity>
    );

    if (tela === 'menu') {
  return (
    
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={estilos.fundo}>
      <Text style={estilos.titulo}>ReflexMaster</Text>
      {/* <Image
        source={require('./assets/logo.png')}
        style={estilos.logo}
        resizeMode="contain"
      /> */}
      <BotaoMenu titulo="Jogar" onPress={iniciarJogo} />
      <BotaoMenu titulo="Como Jogar" onPress={() => setTela('instrucoes')} />
      <BotaoMenu titulo="Ranking" onPress={() => setTela('ranking')} />
      <BotaoMenu titulo="Sobre" onPress={() => setTela('sobre')} />
    </LinearGradient>
  );
}


    if (tela === 'resultado') {
      return (
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={estilos.fundo}>
          <Text style={estilos.titulo}>✅ Fim de Jogo</Text>
          <Text style={estilos.texto}>Sua pontuação: {pontuacao}</Text>
          <TextInput
            style={estilos.input}
            placeholder="Digite seu nome"
            value={nomeJogador}
            onChangeText={setNomeJogador}
          />
          <BotaoMenu titulo="Salvar no Ranking" onPress={salvarNoRanking} />
        </LinearGradient>
      );
    }

    if (tela === 'ranking') {
      return (
      <LinearGradient colors={['#6a11cb', '#2575fc']} style={estilos.fundo}>
          <Text style={estilos.titulo}>Ranking</Text>
          {ranking.length === 0 && <Text style={estilos.texto}>Nenhum registro ainda.</Text>}
          <FlatList
            data={ranking}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text style={estilos.texto}>
                {index + 1}. {item.nome} - {item.pontuacao} pts
              </Text>
            )}
          />
          <BotaoMenu titulo="Voltar" onPress={() => setTela('menu')} />
        </LinearGradient>
      );
    }

    if (tela === 'jogo') {
      return (
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={estilos.fundo}>
          <Text style={estilos.titulo2}>Tempo: {tempoRestante}s</Text>
          <Text style={estilos.titulo2}>Pontos: {pontuacao}</Text>
          {botaoVisivel && (
            <TouchableOpacity
              style={[estilos.botaoJogo, { top: posicaoBotao.top, left: posicaoBotao.left }]}
              onPress={aoClicarBotao}
            >
              <Text style={{ fontSize: 20 }}>🎯</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      );
    }

    if (tela === 'instrucoes') {
      return (
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={estilos.fundo}>
          <Text style={estilos.titulo}>Como Jogar</Text>
          <Text style={estilos.texto}>
            Toque no botão o mais rápido possível quando ele aparecer. Quanto mais rápido, mais pontos você ganha! O botão desaparece em 2 segundos!
          </Text>
          <BotaoMenu titulo="Voltar" onPress={() => setTela('menu')} />
        </LinearGradient>
      );
    }

    if (tela === 'sobre') {
      return (
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={estilos.fundo}>
          <Text style={estilos.titulo}>Sobre</Text>
          <Text style={estilos.texto}>Desenvolvido por Igor de Araujo Borges</Text>
          <Text style={estilos.texto}>RA: 22.223.006-2</Text>
          <Text style={estilos.texto}>Turma: 620 - Ciência da Computação</Text>
          <BotaoMenu titulo="Voltar" onPress={() => setTela('menu')} />
        </LinearGradient>
      );
    }

    return null;
  }

  const estilos = StyleSheet.create({
    alvo:{

    },
    centro: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      backgroundColor: '#e0f7fa',
    },
    container: {
      flex: 1,
      padding: 30,
      justifyContent: 'center',
      backgroundColor: '#f0fdf4',
    },
    titulo: {
      fontFamily: 'Oi-Regular', 
      fontSize: 27,
      marginBottom: 30,
      color: '#ffffff',
      textAlign: 'center',
    },
    titulo2: {
      fontFamily: 'Oi-Regular', 
      fontSize: 18,
      marginBottom: 30,
      color: '#ffffff',
      textAlign: 'center',
    },
    texto: {
      fontSize: 18,
      marginVertical: 6,
      textAlign: 'center',
      color: '#ffffff',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginVertical: 12,
      borderRadius: 6,
      backgroundColor: '#fff',
    },
    areaJogo: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 30,
    },
    botaoJogo: {
      position: 'absolute',
      backgroundColor: '#ffffff',
      padding: 20,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    status: {
      fontSize: 18,
      margin: 10,
      textAlign: 'center',
      color: '#004D40',
    },
    fundo: {
      flex: 1,
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoMenu: {
  backgroundColor: '#ffffff',
  padding: 14,
  borderRadius: 12,
  marginVertical: 8,
  width: '80%',
  alignItems: 'center',

},
textoBotao: {
  color: '#6a11cb',
  fontSize: 18,
  fontWeight: 'bold',
}

  });
