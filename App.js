import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  Dimensions,
} from 'react-native';

export default function App() {
  const [tela, setTela] = useState('menu'); // menu, jogo, instrucoes, sobre, resultado, ranking


  // Telas
  if (tela === 'menu') {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>⚡ ReflexMaster</Text>
        <Button title="Jogar" onPress={iniciarJogo} />
        <Button title="Como Jogar" onPress={() => setTela('instrucoes')} />
        <Button title="Ranking" onPress={() => setTela('ranking')} />
        <Button title="Sobre" onPress={() => setTela('sobre')} />
      </View>
    );
  }

  if (tela === 'instrucoes') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>📘 Como Jogar</Text>
        <Text style={estilos.texto}>
          Toque no botão o mais rápido possível quando ele aparecer. Quanto mais rápido, mais pontos você ganha! O botão desaparece em 2 segundos!
        </Text>
        <Button title="Voltar" onPress={() => setTela('menu')} />
      </View>
    );
  }

  if (tela === 'sobre') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}> Sobre</Text>
        <Text style={estilos.texto}>Desenvolvido por Igor de Araujo Borges</Text>
        <Text style={estilos.texto}>RA: 22.223.006-2</Text>
        <Text style={estilos.texto}>Turma: 620 - Ciência da Computação</Text>
        <Button title="Voltar" onPress={() => setTela('menu')} />
      </View>
    );
  }







  return null;
}


